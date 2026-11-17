import { buildChatApp, makePostgresSaver, safeThreadId } from "./persist";

// รันกับ Postgres จริง: เปิดด้วย `docker compose up -d --wait` และตั้ง DATABASE_URL ใน .env (ดู .env.example)
// บทนี้ไม่ใช้ LLM จึงอ่านแค่ DATABASE_URL จาก .env โดยตรง (ไม่ต้องมี API key)
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.log("ยังไม่ได้ตั้ง DATABASE_URL ใน .env (คัดลอกค่าจาก .env.example แล้วเปิดฐานข้อมูลด้วย docker compose up -d --wait)");
  process.exit(0);
}

const saver = makePostgresSaver(url);
try {
  await saver.setup(); // สร้างตาราง checkpoint ถ้ายังไม่มี
  const app = buildChatApp(saver);
  const cfg = { configurable: { thread_id: safeThreadId("course-4-24") } };
  const first = await app.invoke({ messages: [{ role: "user", content: "สวัสดี" }] }, cfg);
  console.log(first.messages.at(-1)?.text);
  const second = await app.invoke({ messages: [{ role: "user", content: "จำได้ไหม" }] }, cfg);
  console.log(second.messages.at(-1)?.text, "(รันซ้ำอีกครั้ง ตัวเลขจะเพิ่มขึ้น เพราะความจำอยู่ในฐานข้อมูล)");
} finally {
  await saver.end();
}
