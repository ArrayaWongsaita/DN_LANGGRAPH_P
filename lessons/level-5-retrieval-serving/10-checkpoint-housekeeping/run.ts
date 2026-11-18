import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import pg from "pg";
import { z } from "zod";
import { SQL, pruneThread } from "./housekeeping";

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

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const saver = new PostgresSaver(pool);
const thread = `demo-5-13-${Date.now()}`;
const count = async (table: string) => Number((await pool.query(`SELECT count(*) FROM ${table} WHERE thread_id = $1`, [thread])).rows[0].count);

try {
  await saver.setup();
  const State = new StateSchema({ n: z.number().default(0), note: z.string().default("ไม่เปลี่ยน") });
  const app = new StateGraph(State)
    .addNode("step", (s) => ({ n: s.n + 1 }))
    .addEdge(START, "step")
    .addEdge("step", END)
    .compile({ checkpointer: saver });
  const cfg = { configurable: { thread_id: thread } };
  for (let i = 0; i < 6; i++) await app.invoke({}, cfg);
  console.log("ก่อนลบ  checkpoints:", await count("checkpoints"), " blobs:", await count("checkpoint_blobs"), " writes:", await count("checkpoint_writes"));

  const client = await pool.connect(); // ธุรกรรมต้องใช้ client ตัวเดียว
  try {
    console.log("ลบ:", await pruneThread(client, thread, 2));
  } finally {
    client.release();
  }
  console.log("หลังลบ  checkpoints:", await count("checkpoints"), " blobs:", await count("checkpoint_blobs"), " writes:", await count("checkpoint_writes"));

  const state = await app.getState(cfg);
  console.log("ยังอ่านสถานะได้: n =", state.values.n, "(ควรเป็น 6)");
  const next = await app.invoke({}, cfg);
  console.log("รันต่อได้: n =", next.n, "(ควรเป็น 7)");
  console.log("SQL ที่ใช้:", Object.keys(SQL).join(", "));
} finally {
  await saver.deleteThread(thread); // ลบข้อมูลทดลองทิ้ง
  await pool.end();
}
