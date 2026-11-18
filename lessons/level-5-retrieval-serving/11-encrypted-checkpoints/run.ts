import { randomBytes } from "node:crypto";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import pg from "pg";
import { z } from "zod";
import { EncryptedSerde, parseKey } from "./encrypted";

// ต้องเปิด Docker (docker compose up -d --wait) และตั้ง DATABASE_URL ใน .env
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
if (!process.env.DATABASE_URL) {
  console.log("ยังไม่ได้ตั้ง DATABASE_URL ใน .env (ดู .env.example)");
  process.exit(0);
}

const SECRET = "เลขบัตร-4111-SECRET";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// งานจริง: parseKey(process.env.CHECKPOINT_KEY!) (ที่นี่สุ่มกุญแจชั่วคราวเพื่อสาธิต)
const key = parseKey(randomBytes(32).toString("hex"));

const State = new StateSchema({ secret: z.string().default("") });
const build = (saver: PostgresSaver) =>
  new StateGraph(State)
    .addNode("a", () => ({ secret: SECRET }))
    .addEdge(START, "a")
    .addEdge("a", END)
    .compile({ checkpointer: saver });

async function leaks(thread: string) {
  const needle = Buffer.from(SECRET);
  const blobs = (await pool.query("SELECT blob FROM checkpoint_blobs WHERE thread_id = $1 AND blob IS NOT NULL", [thread])).rows;
  const writes = (await pool.query("SELECT blob FROM checkpoint_writes WHERE thread_id = $1 AND blob IS NOT NULL", [thread])).rows;
  const cps = (await pool.query("SELECT checkpoint::text AS t FROM checkpoints WHERE thread_id = $1", [thread])).rows;
  return {
    blobs: blobs.some((r) => Buffer.from(r.blob).includes(needle)),
    writes: writes.some((r) => Buffer.from(r.blob).includes(needle)),
    checkpointJson: cps.some((r) => String(r.t).includes(SECRET)),
  };
}

const plainThread = `demo-5-11-plain-${Date.now()}`;
const encThread = `demo-5-11-enc-${Date.now()}`;
const plainSaver = new PostgresSaver(pool);
const encSaver = new PostgresSaver(pool, new EncryptedSerde(key));
try {
  await plainSaver.setup();
  await build(plainSaver).invoke({}, { configurable: { thread_id: plainThread } });
  const encApp = build(encSaver);
  await encApp.invoke({}, { configurable: { thread_id: encThread } });

  console.log("ไม่เข้ารหัส — ข้อความลับอยู่ในฐานข้อมูลหรือไม่:", await leaks(plainThread));
  console.log("เข้ารหัส     — ข้อความลับอยู่ในฐานข้อมูลหรือไม่:", await leaks(encThread));
  console.log("อ่านกลับด้วยกุญแจเดิม:", (await encApp.getState({ configurable: { thread_id: encThread } })).values.secret);
  try {
    await build(new PostgresSaver(pool, new EncryptedSerde(parseKey(randomBytes(32).toString("hex"))))).getState({ configurable: { thread_id: encThread } });
  } catch (error) {
    console.log("อ่านด้วยกุญแจอื่น →", (error as Error).message);
  }
} finally {
  await plainSaver.deleteThread(plainThread);
  await encSaver.deleteThread(encThread);
  await pool.end();
}
