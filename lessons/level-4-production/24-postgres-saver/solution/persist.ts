import { createHash } from "node:crypto";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-24  (ไม่ใช้ LLM แต่ต้องเปิดฐานข้อมูล: docker compose up -d --wait และตั้ง DATABASE_URL ใน .env)
// Postgres เป็นที่เก็บ checkpoint ถาวร: ความจำของแอปรอดแม้ปิดโปรแกรมแล้วเปิดใหม่ (MemorySaver หายทันทีที่โปรแกรมจบ)
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.log("ยังไม่ได้ตั้ง DATABASE_URL ใน .env (คัดลอกค่าจาก .env.example แล้วเปิดฐานข้อมูลด้วย docker compose up -d --wait)");
  process.exit(1);
}

const MAX_THREAD_ID = 255;

// ถ้า thread_id ยาวเกิน MAX_THREAD_ID ให้เปลี่ยนเป็น "t_" + sha256 (hex) ของมัน ไม่เช่นนั้นคืนค่าเดิม
function safeThreadId(id: string): string {
  // ข้อ 1: ถ้า id.length <= MAX_THREAD_ID คืน id; ไม่เช่นนั้นคืน "t_" + createHash("sha256").update(id).digest("hex")
  return id.length <= MAX_THREAD_ID ? id : "t_" + createHash("sha256").update(id).digest("hex");
}

// สร้าง saver จากลิงก์เชื่อมต่อ (ยังไม่เชื่อมต่อจนกว่าจะใช้งาน)
// ข้อ 2: คืน PostgresSaver.fromConnString(connectionString)
function makeSaver(connectionString: string): PostgresSaver {
  return PostgresSaver.fromConnString(connectionString);
}

const State = new StateSchema({ messages: MessagesValue });

// แอปแชตเรียบง่าย: นับจำนวนข้อความในประวัติแล้วตอบ
function buildChatApp(saver: PostgresSaver) {
  const builder = new StateGraph(State)
    .addNode("reply", (state) => ({ messages: [{ role: "assistant", content: `ฉันจำได้ ${state.messages.length} ข้อความ` }] }))
    .addEdge(START, "reply")
    .addEdge("reply", END);
  // ข้อ 3: คืน builder.compile({ checkpointer: saver })
  return builder.compile({ checkpointer: saver });
}

// thread ใหม่ทุกครั้งที่รัน เพื่อให้ตัวเลขนับจากศูนย์ (ใน thread เดียวกัน รันซ้ำตัวเลขจะเพิ่มขึ้นเพราะความจำอยู่ในฐานข้อมูล)
const threadId = safeThreadId(`course-4-24-${Date.now()}`);
const cfg = { configurable: { thread_id: threadId } };
const cfgOther = { configurable: { thread_id: threadId + "-other" } };
const texts: string[] = [];

const saver1 = makeSaver(url);
await saver1.setup(); // สร้างตาราง checkpoint ถ้ายังไม่มี
const app1 = buildChatApp(saver1);
texts.push((await app1.invoke({ messages: [{ role: "user", content: "สวัสดี" }] }, cfg)).messages.at(-1)?.text ?? "");
texts.push((await app1.invoke({ messages: [{ role: "user", content: "อีกที" }] }, cfg)).messages.at(-1)?.text ?? "");
const other = (await app1.invoke({ messages: [{ role: "user", content: "y" }] }, cfgOther)).messages.at(-1)?.text ?? "";
await saver1.end(); // ปิดการเชื่อมต่อ จำลองว่าโปรแกรมจบไปแล้ว

// เปิด saver ใหม่ (เหมือนเปิดโปรแกรมใหม่) thread เดิมต้องยังจำได้
const saver2 = makeSaver(url);
const app2 = buildChatApp(saver2);
texts.push((await app2.invoke({ messages: [{ role: "user", content: "จำได้ไหม" }] }, cfg)).messages.at(-1)?.text ?? "");
await saver2.end();
console.log({ texts, other });

const longId = "x".repeat(MAX_THREAD_ID + 50);
const hashed = safeThreadId(longId);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("แอปจำประวัติข้ามการเรียก (สองข้อความผู้ใช้ รวม 3 ข้อความ)", texts[1] === "ฉันจำได้ 3 ข้อความ", "ต้อง compile พร้อม checkpointer");
check("thread แยกกัน", other === "ฉันจำได้ 1 ข้อความ");
check("ปิดแล้วเปิดใหม่ ความจำยังอยู่ในฐานข้อมูล (5 ข้อความ)", texts[2] === "ฉันจำได้ 5 ข้อความ", "ข้อมูลอยู่ใน Postgres ไม่ใช่ในหน่วยความจำ");
check("safeThreadId: สั้นพอคงเดิม", safeThreadId("user-1") === "user-1");
check("safeThreadId: ยาวเกินย่อด้วย hash ที่คงที่ ไม่เกินขีดจำกัด", hashed.length <= MAX_THREAD_ID && hashed.startsWith("t_") && safeThreadId(longId) === hashed && safeThreadId(longId + "y") !== hashed);
