import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { JsonPlusSerializer } from "@langchain/langgraph-checkpoint";
import type { SerializerProtocol } from "@langchain/langgraph-checkpoint";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import pg from "pg";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-11  (ต้องเปิดฐานข้อมูล docker compose up -d --wait และมี DATABASE_URL ใน .env ไม่ใช้ LLM)
// checkpoint เก็บ state ทั้งก้อนลงฐานข้อมูล ถ้า state มีข้อมูลอ่อนไหวก็ถูกเก็บเป็นข้อความธรรมดา บทนี้ครอบ serializer ด้วยการเข้ารหัส AES-256-GCM: ข้อมูลในฐานข้อมูลอ่านไม่ออกถ้าไม่มีกุญแจ และถูกแก้ก็ถอดไม่ผ่าน
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.log("ยังไม่ได้ตั้ง DATABASE_URL ใน .env (ดู .env.example)");
  process.exit(1);
}

// ตัวนำที่บอกว่าไบต์ชุดนี้เข้ารหัสแล้ว
const MAGIC = Buffer.from("ENC1");
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function isEncrypted(data: Uint8Array | string): boolean {
  return typeof data !== "string" && Buffer.from(data).subarray(0, MAGIC.length).equals(MAGIC);
}

// metadata ของ checkpoint ({ source, step, parents }): PostgresSaver แปลงเป็น JSON ใน jsonb เพื่อกรองด้วย SQL จึงต้องคงเป็นข้อความธรรมดา
function isCheckpointMetadata(data: unknown): boolean {
  return typeof data === "object" && data !== null && "source" in data && "step" in data && "parents" in data;
}

// กุญแจมาจาก hex 64 ตัวอักษร (= 32 ไบต์)
function parseKey(hex: string): Buffer {
  // ข้อ 1: ถ้า hex ไม่ตรงรูป /^[0-9a-fA-F]{64}$/ ให้ throw new Error("กุญแจต้องเป็น hex 64 ตัวอักษร (32 ไบต์)")
  //          ไม่งั้นคืน Buffer.from(hex, "hex")
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) throw new Error("กุญแจต้องเป็น hex 64 ตัวอักษร (32 ไบต์)");
  return Buffer.from(hex, "hex");
}

function encryptBytes(key: Buffer, plain: Uint8Array): Uint8Array {
  // ข้อ 2: iv = randomBytes(12) (สุ่มใหม่ทุกครั้ง); cipher = createCipheriv("aes-256-gcm", key, iv)
  //          ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]); tag = cipher.getAuthTag()
  //          คืน Buffer.concat([MAGIC, iv, tag, ciphertext])
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([MAGIC, iv, cipher.getAuthTag(), ciphertext]);
}

function decryptBytes(key: Buffer, data: Uint8Array): Uint8Array {
  // ข้อ 3: แยก iv (ถัดจาก MAGIC 12 ไบต์), tag (16 ไบต์), ciphertext (ที่เหลือ) แล้วใช้ createDecipheriv("aes-256-gcm", key, iv)
  //          ใส่ setAuthTag(tag) แล้ว Buffer.concat([update(ciphertext), final()])
  //          ถ้า final() โยน error (กุญแจผิด/ข้อมูลถูกแก้) ให้ throw new Error("ถอดรหัสไม่ได้ (กุญแจผิดหรือข้อมูลถูกแก้)")
  const buf = Buffer.from(data);
  const iv = buf.subarray(MAGIC.length, MAGIC.length + IV_LENGTH);
  const tag = buf.subarray(MAGIC.length + IV_LENGTH, MAGIC.length + IV_LENGTH + TAG_LENGTH);
  const ciphertext = buf.subarray(MAGIC.length + IV_LENGTH + TAG_LENGTH);
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error("ถอดรหัสไม่ได้ (กุญแจผิดหรือข้อมูลถูกแก้)");
  }
}

class EncryptedSerde implements SerializerProtocol {
  constructor(
    private readonly key: Buffer,
    private readonly inner: SerializerProtocol = new JsonPlusSerializer(),
  ) {}

  async dumpsTyped(data: unknown): Promise<[string, Uint8Array]> {
    // ข้อ 4a: [type, bytes] = await this.inner.dumpsTyped(data)
    //          ถ้า isCheckpointMetadata(data) คืน [type, bytes] ตามเดิม (ไม่เข้ารหัส) ไม่งั้นคืน [type, encryptBytes(this.key, bytes)] (คงชนิดเดิมไว้)
    const [type, bytes] = await this.inner.dumpsTyped(data);
    return isCheckpointMetadata(data) ? [type, bytes] : [type, encryptBytes(this.key, bytes)];
  }

  async loadsTyped(type: string, data: Uint8Array | string): Promise<unknown> {
    // ข้อ 4b: ถ้า isEncrypted(data) ให้ถอดรหัสด้วย decryptBytes (data เป็นไบต์แน่นอน) แล้วส่งให้ this.inner.loadsTyped(type, ผลที่ถอด)
    //          ถ้าไม่ใช่ (ข้อมูลเก่าที่ยังไม่เข้ารหัส) ส่ง data เดิมให้ this.inner.loadsTyped(type, data) ตรง ๆ
    if (isEncrypted(data)) return this.inner.loadsTyped(type, decryptBytes(this.key, data as Uint8Array));
    return this.inner.loadsTyped(type, data);
  }
}

const key = () => randomBytes(32);
const text = (b: Uint8Array) => Buffer.from(b).toString("utf8");
const sync = (fn: () => void): string => {
  try {
    fn();
    return "";
  } catch (e) {
    return (e as Error).message;
  }
};
const rejects = async (p: Promise<unknown>): Promise<string> => {
  try {
    await p;
    return "";
  } catch (e) {
    return (e as Error).message;
  }
};
function containsText(o: unknown, needle: string): boolean {
  if (o instanceof Uint8Array) return Buffer.from(o).includes(needle);
  if (typeof o === "string") return o.includes(needle);
  if (o && typeof o === "object") return Object.values(o).some((v) => containsText(v, needle));
  return false;
}

// ส่วนที่ 1: ฟังก์ชันเข้า/ถอดรหัสและ serializer ทีละชั้น
const hex = randomBytes(32).toString("hex");
const k = key();
const enc = encryptBytes(k, Buffer.from("ความลับ ABC-123"));
const sameA = Buffer.from(encryptBytes(k, Buffer.from("เหมือนกัน")));
const sameB = Buffer.from(encryptBytes(k, Buffer.from("เหมือนกัน")));
const tampered = Buffer.from(encryptBytes(k, Buffer.from("ข้อมูลสำคัญ")));
const cipherTampered = Buffer.from(tampered);
cipherTampered[cipherTampered.length - 1] ^= 1;
const tagTampered = Buffer.from(tampered);
tagTampered[20] ^= 1;
const serde = new EncryptedSerde(key());
const value = { a: 1, b: ["ก", { c: null }], d: "ลับ" };
const [vType, vBytes] = await serde.dumpsTyped(value);
const [, metaBytes] = await serde.dumpsTyped({ source: "loop", step: 1, parents: {} });
const [, otherBytes] = await serde.dumpsTyped({ source: "loop" });
const [legacyType, legacy] = await new JsonPlusSerializer().dumpsTyped({ old: "ข้อมูลเก่า" });
const [wrongType, wrongBytes] = await new EncryptedSerde(key()).dumpsTyped({ a: 1 });

// ส่วนที่ 2: กับกราฟจริงบน MemorySaver (เทียบกับตัวควบคุมที่ไม่เข้ารหัส)
const SECRET = "รหัสลับ-SECRET-999";
const State = new StateSchema({ secret: z.string().default("") });
const build = (saver: MemorySaver | PostgresSaver) =>
  new StateGraph(State)
    .addNode("a", () => ({ secret: SECRET }))
    .addEdge(START, "a")
    .addEdge("a", END)
    .compile({ checkpointer: saver });
const cfg = { configurable: { thread_id: "t" } };
type Inner = { storage: unknown; writes: unknown };
const encrypted = new MemorySaver(new EncryptedSerde(key()));
const app = build(encrypted);
await app.invoke({}, cfg);
const readBack = (await app.getState(cfg)).values.secret;
const plain = new MemorySaver();
await build(plain).invoke({}, cfg);
const intruder = new MemorySaver(new EncryptedSerde(key()));
(intruder as unknown as Inner).storage = (encrypted as unknown as Inner).storage;
(intruder as unknown as Inner).writes = (encrypted as unknown as Inner).writes;
const intruderMsg = await rejects(build(intruder).getState(cfg));

// ส่วนที่ 3: Postgres จริง ดูว่าข้อความลับอยู่ในตารางหรือไม่
const pool = new pg.Pool({ connectionString: url });
const dbKey = parseKey(randomBytes(32).toString("hex")); // งานจริง: parseKey(process.env.CHECKPOINT_KEY!)
async function leaks(thread: string) {
  const needle = Buffer.from(SECRET);
  const blobs = (await pool.query("SELECT blob FROM checkpoint_blobs WHERE thread_id = $1 AND blob IS NOT NULL", [thread])).rows;
  const writes = (await pool.query("SELECT blob FROM checkpoint_writes WHERE thread_id = $1 AND blob IS NOT NULL", [thread])).rows;
  const cps = (await pool.query("SELECT checkpoint::text AS t FROM checkpoints WHERE thread_id = $1", [thread])).rows;
  return blobs.some((r) => Buffer.from(r.blob).includes(needle)) || writes.some((r) => Buffer.from(r.blob).includes(needle)) || cps.some((r) => String(r.t).includes(SECRET));
}
const plainThread = `demo-5-11-plain-${Date.now()}`;
const encThread = `demo-5-11-enc-${Date.now()}`;
const plainSaver = new PostgresSaver(pool);
const encSaver = new PostgresSaver(pool, new EncryptedSerde(dbKey));
let plainLeaks = false;
let encLeaks = true;
let dbRead = "";
let dbWrongMsg = "";
try {
  await plainSaver.setup();
  await build(plainSaver).invoke({}, { configurable: { thread_id: plainThread } });
  const encApp = build(encSaver);
  await encApp.invoke({}, { configurable: { thread_id: encThread } });
  plainLeaks = await leaks(plainThread);
  encLeaks = await leaks(encThread);
  dbRead = (await encApp.getState({ configurable: { thread_id: encThread } })).values.secret;
  dbWrongMsg = await rejects(build(new PostgresSaver(pool, new EncryptedSerde(parseKey(randomBytes(32).toString("hex"))))).getState({ configurable: { thread_id: encThread } }));
  console.log({ plainLeaks, encLeaks, dbRead, dbWrongMsg });
} finally {
  await plainSaver.deleteThread(plainThread);
  await encSaver.deleteThread(encThread);
  await pool.end();
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("parseKey: รับ hex 64 ตัว คืน 32 ไบต์", parseKey(hex).equals(Buffer.from(hex, "hex")) && parseKey(hex).length === 32);
check("parseKey: ปฏิเสธกุญแจสั้น/ยาว/ไม่ใช่ hex ด้วยข้อความที่อธิบายได้", ["", "abc", "z".repeat(64), "a".repeat(63), "a".repeat(65), ` ${"a".repeat(64)}`].every((bad) => sync(() => parseKey(bad)).includes("กุญแจต้องเป็น hex 64 ตัวอักษร")));
check("encrypt/decrypt: ไปกลับได้ ไบต์ที่เก็บขึ้นต้น ENC1 และไม่มีข้อความเดิม", isEncrypted(enc) && Buffer.from(enc).subarray(0, 4).equals(MAGIC) && !Buffer.from(enc).includes("ABC-123") && text(decryptBytes(k, enc)) === "ความลับ ABC-123");
check("iv สุ่มใหม่ทุกครั้ง: ข้อความเดียวกันเข้ารหัสสองครั้งได้ไบต์ต่างกัน", !sameA.equals(sameB) && !sameA.subarray(4, 16).equals(sameB.subarray(4, 16)));
check("กุญแจผิด: โยน error ที่อ่านรู้เรื่อง", sync(() => decryptBytes(key(), enc)).includes("ถอดรหัสไม่ได้"));
check("ข้อมูลถูกแก้ (ciphertext หรือ tag): ถอดไม่ผ่าน", sync(() => decryptBytes(k, cipherTampered)).includes("ถอดรหัสไม่ได้") && sync(() => decryptBytes(k, tagTampered)).includes("ถอดรหัสไม่ได้"));
check("isEncrypted: สตริงและไบต์ธรรมดาไม่ใช่", !isEncrypted("ENC1....") && !isEncrypted(Buffer.from("{}")));
check("EncryptedSerde: ไปกลับได้กับออบเจ็กต์ซ้อน และคงชนิดเดิม", vType === "json" && isEncrypted(vBytes) && JSON.stringify(await serde.loadsTyped(vType, vBytes)) === JSON.stringify(value));
check("EncryptedSerde: metadata ของ checkpoint คงเป็น JSON ธรรมดา ข้อมูลอื่นเข้ารหัส", !isEncrypted(metaBytes) && JSON.stringify(JSON.parse(text(metaBytes))) === JSON.stringify({ source: "loop", step: 1, parents: {} }) && isEncrypted(otherBytes));
check("EncryptedSerde: ข้อมูลเก่าที่ยังไม่เข้ารหัสยังอ่านได้", JSON.stringify(await new EncryptedSerde(key()).loadsTyped(legacyType, legacy)) === JSON.stringify({ old: "ข้อมูลเก่า" }));
check("EncryptedSerde: อ่านด้วยกุญแจอื่นไม่ได้", (await rejects(new EncryptedSerde(key()).loadsTyped(wrongType, wrongBytes))).includes("ถอดรหัสไม่ได้"));
check("กับกราฟจริง: อ่านสถานะกลับได้ แต่ที่เก็บไม่มีข้อความลับ (ตัวควบคุมที่ไม่เข้ารหัสมี)", readBack === SECRET && !containsText((encrypted as unknown as Inner).storage, "SECRET-999") && containsText((plain as unknown as Inner).storage, "SECRET-999"));
check("กับกราฟจริง: กุญแจอื่นอ่าน thread เดิมไม่ได้", intruderMsg.includes("ถอดรหัสไม่ได้"));
check("Postgres จริง: ไม่เข้ารหัสเห็นข้อความลับในตาราง เข้ารหัสไม่เห็น แต่อ่านกลับด้วยกุญแจเดิมได้", plainLeaks && !encLeaks && dbRead === SECRET && dbWrongMsg.includes("ถอดรหัสไม่ได้"), "ตรวจ docker compose และ DATABASE_URL");
