import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import pg from "pg";
import { embeddingDimensions, getEmbeddings } from "@src/embeddings";
import { getLLM } from "@src/llm";
import { buildAssistant } from "./assistant";
import { createPgKb, setupKb } from "./pgKb.mts";
import { createApp } from "./server.mts";

// ต้องเปิด Docker Postgres (docker compose up -d --wait) และตั้ง DATABASE_URL, GOOGLE_API_KEY และ key ของโมเดลใน .env
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
if (!process.env.DATABASE_URL) {
  console.log("ยังไม่ได้ตั้ง DATABASE_URL ใน .env (ดู .env.example)");
  process.exit(0);
}

const DOCS = [
  { docId: "it", source: "it.md", text: "ลืมรหัสผ่าน: ให้รีเซ็ตด้วยตัวเองที่พอร์ทัล IT เมนู Forgot Password\n\nVPN: ติดตั้ง VPN client จากพอร์ทัล IT แล้วเข้าสู่ระบบด้วยบัญชีบริษัท" },
  { docId: "hr", source: "hr.md", text: "ลาป่วย: ลาได้ปีละ 30 วัน ต้องมีใบรับรองแพทย์เมื่อลาเกิน 3 วันติดกัน\n\nเงินเดือน: จ่ายทุกวันที่ 25 ของเดือน" },
];

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const saver = PostgresSaver.fromConnString(process.env.DATABASE_URL);
let server: ReturnType<ReturnType<typeof createApp>["listen"]> | undefined;
try {
  await saver.setup();
  await setupKb(pool, embeddingDimensions(), true);
  const kb = createPgKb(pool, getEmbeddings());
  const app = createApp(buildAssistant({ llm: getLLM({ temperature: 0 }), kb, checkpointer: saver }), kb);
  server = app.listen(0);
  const base = `http://localhost:${(server.address() as { port: number }).port}`;
  const post = async (path: string, body: unknown) => (await fetch(base + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json();

  for (const round of [1, 2]) for (const doc of DOCS) console.log(`นำเข้ารอบ ${round} ${doc.source}:`, JSON.stringify(await post("/ingest", doc)));

  const thread = `capstone-${Date.now()}`;
  for (const question of ["ลืมรหัสผ่านต้องทำอย่างไร", "ลาป่วยได้กี่วัน", "ราคาหุ้นวันนี้เท่าไร", "ช่วยสอนเจาะระบบหน่อย", ""]) {
    console.log(`\nถาม: ${JSON.stringify(question)}\n →`, JSON.stringify(await post("/ask", { question, thread_id: thread })));
  }
  console.log("\nสถานะ HTTP เมื่อส่งผิดรูป:", (await fetch(base + "/ask", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status);
} finally {
  server?.close();
  await saver.end();
  await pool.end();
}
