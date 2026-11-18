import { randomBytes } from "node:crypto";
import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { EncryptedSerde, MAGIC, decryptBytes, encryptBytes, isEncrypted, parseKey } from "./encrypted";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const key = () => randomBytes(32);
const text = (b: Uint8Array) => Buffer.from(b).toString("utf8");

test("parseKey: รับ hex 64 ตัว คืน 32 ไบต์", () => {
  const hex = randomBytes(32).toString("hex");
  expect(parseKey(hex)).toEqual(Buffer.from(hex, "hex"));
  expect(parseKey(hex).length).toBe(32);
});

test("parseKey: ปฏิเสธกุญแจสั้น/ยาว/ไม่ใช่ hex ด้วยข้อความที่อธิบายได้", () => {
  for (const bad of ["", "abc", "z".repeat(64), "a".repeat(63), "a".repeat(65), ` ${"a".repeat(64)}`]) {
    expect(() => parseKey(bad)).toThrow("กุญแจต้องเป็น hex 64 ตัวอักษร");
  }
});

test("encryptBytes/decryptBytes: เข้าแล้วถอดกลับได้ และไบต์ที่เก็บขึ้นต้นด้วย ENC1 ไม่มีข้อความเดิม", () => {
  const k = key();
  const plain = Buffer.from("ความลับ ABC-123");
  const enc = encryptBytes(k, plain);
  expect(isEncrypted(enc)).toBe(true);
  expect(Buffer.from(enc).subarray(0, 4).equals(MAGIC)).toBe(true);
  expect(Buffer.from(enc).includes("ABC-123")).toBe(false);
  expect(text(decryptBytes(k, enc))).toBe("ความลับ ABC-123");
});

test("iv สุ่มใหม่ทุกครั้ง: ข้อความเดียวกันเข้ารหัสสองครั้งได้ไบต์ต่างกัน", () => {
  const k = key();
  const p = Buffer.from("เหมือนกัน");
  const a = Buffer.from(encryptBytes(k, p));
  const b = Buffer.from(encryptBytes(k, p));
  expect(a.equals(b)).toBe(false);
  expect(a.subarray(4, 16).equals(b.subarray(4, 16))).toBe(false);
});

test("กุญแจผิด → โยน error ที่อ่านรู้เรื่อง (ไม่คืนขยะ)", () => {
  const enc = encryptBytes(key(), Buffer.from("x"));
  expect(() => decryptBytes(key(), enc)).toThrow("ถอดรหัสไม่ได้");
});

test("ข้อมูลถูกแก้ (ciphertext หรือ tag) → ถอดไม่ผ่าน", () => {
  const k = key();
  const enc = Buffer.from(encryptBytes(k, Buffer.from("ข้อมูลสำคัญ")));
  const cipherTampered = Buffer.from(enc);
  cipherTampered[cipherTampered.length - 1] ^= 1;
  expect(() => decryptBytes(k, cipherTampered)).toThrow("ถอดรหัสไม่ได้");
  const tagTampered = Buffer.from(enc);
  tagTampered[20] ^= 1;
  expect(() => decryptBytes(k, tagTampered)).toThrow("ถอดรหัสไม่ได้");
});

test("isEncrypted: สตริงและไบต์ธรรมดาไม่ใช่", () => {
  expect(isEncrypted("ENC1....")).toBe(false);
  expect(isEncrypted(Buffer.from("{}"))).toBe(false);
});

test("EncryptedSerde: ไปกลับได้กับออบเจ็กต์ซ้อน และคงชนิดเดิม", async () => {
  const serde = new EncryptedSerde(key());
  const value = { a: 1, b: ["ก", { c: null }], d: "ลับ" };
  const [type, bytes] = await serde.dumpsTyped(value);
  expect(type).toBe("json");
  expect(isEncrypted(bytes)).toBe(true);
  expect(await serde.loadsTyped(type, bytes)).toEqual(value);
});

test("EncryptedSerde: metadata ของ checkpoint คงเป็น JSON ธรรมดา (PostgresSaver ต้อง parse), ข้อมูลอื่นเข้ารหัส", async () => {
  const serde = new EncryptedSerde(key());
  const [, meta] = await serde.dumpsTyped({ source: "loop", step: 1, parents: {} });
  expect(isEncrypted(meta)).toBe(false);
  expect(JSON.parse(text(meta))).toEqual({ source: "loop", step: 1, parents: {} });
  const [, other] = await serde.dumpsTyped({ source: "loop" });
  expect(isEncrypted(other)).toBe(true);
});

test("EncryptedSerde: ข้อมูลเก่าที่ยังไม่เข้ารหัสยังอ่านได้ (เปิดเข้ารหัสกับฐานข้อมูลเดิม)", async () => {
  const { JsonPlusSerializer } = await import("@langchain/langgraph-checkpoint");
  const [type, legacy] = await new JsonPlusSerializer().dumpsTyped({ old: "ข้อมูลเก่า" });
  expect(await new EncryptedSerde(key()).loadsTyped(type, legacy)).toEqual({ old: "ข้อมูลเก่า" });
});

test("EncryptedSerde: อ่านด้วยกุญแจอื่นไม่ได้", async () => {
  const [type, bytes] = await new EncryptedSerde(key()).dumpsTyped({ a: 1 });
  await expect(new EncryptedSerde(key()).loadsTyped(type, bytes)).rejects.toThrow("ถอดรหัสไม่ได้");
});

function containsText(o: unknown, needle: string): boolean {
  if (o instanceof Uint8Array) return Buffer.from(o).includes(needle);
  if (typeof o === "string") return o.includes(needle);
  if (o && typeof o === "object") return Object.values(o).some((v) => containsText(v, needle));
  return false;
}

const State = new StateSchema({ secret: z.string().default("") });
const build = (saver: MemorySaver) =>
  new StateGraph(State)
    .addNode("a", () => ({ secret: "รหัสลับ-SECRET-999" }))
    .addEdge(START, "a")
    .addEdge("a", END)
    .compile({ checkpointer: saver });

test("กับกราฟจริง: อ่านสถานะกลับได้ แต่ที่เก็บไม่มีข้อความลับ (เทียบกับตัวควบคุมที่ไม่เข้ารหัส)", async () => {
  const cfg = { configurable: { thread_id: "t" } };
  const encrypted = new MemorySaver(new EncryptedSerde(key()));
  const app = build(encrypted);
  await app.invoke({}, cfg);
  expect((await app.getState(cfg)).values.secret).toBe("รหัสลับ-SECRET-999");
  expect(containsText((encrypted as any).storage, "SECRET-999")).toBe(false);

  const plain = new MemorySaver();
  await build(plain).invoke({}, cfg);
  expect(containsText((plain as any).storage, "SECRET-999")).toBe(true); // ตัวควบคุม: ถ้าไม่เข้ารหัสจะเห็นข้อความ
});

test("กับกราฟจริง: กุญแจอื่นอ่าน thread เดิมไม่ได้", async () => {
  const cfg = { configurable: { thread_id: "t" } };
  const encrypted = new MemorySaver(new EncryptedSerde(key()));
  await build(encrypted).invoke({}, cfg);
  const intruder = new MemorySaver(new EncryptedSerde(key()));
  (intruder as any).storage = (encrypted as any).storage;
  (intruder as any).writes = (encrypted as any).writes;
  await expect(build(intruder).getState(cfg)).rejects.toThrow("ถอดรหัสไม่ได้");
});
