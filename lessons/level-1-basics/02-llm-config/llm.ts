import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { todo } from "@src/todo";
import { env } from "../01-env-schema/env"; // env ที่คุณตรวจไว้ในบท 01

// รันด้วย: pnpm lesson 02
// ไฟล์นี้สร้าง chat model ชื่อ llm แล้ว export ให้บทอื่น import ไปใช้
// ให้เลือกเจ้า LLM "เจ้าเดียว" ที่คุณมี key (บท 01 ตั้ง key ไว้ใน .env แล้ว) ที่เหลือคอมเมนต์ไว้

// 👉 ข้อ 1: เลือกตัวเลือกด้านล่างหนึ่งอัน
//   1) ลบบรรทัด todo ด้านล่างนี้ทิ้ง
//   2) ที่ตัวเลือกที่ต้องการ เอา // หน้าบรรทัด import และ export ออก (import อยู่กลางไฟล์ได้)
export const llm: BaseChatModel = todo(1);

// ── ตัวเลือก A: Groq ──
// import { ChatGroq } from "@langchain/groq";
// export const llm = new ChatGroq({
//   model: env.LLM_MODEL || "openai/gpt-oss-20b",
//   apiKey: env.GROQ_API_KEY,
// });

// ── ตัวเลือก B: Google (Gemini) ──
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// export const llm = new ChatGoogleGenerativeAI({
//   model: env.LLM_MODEL || "gemini-flash-lite-latest",
//   apiKey: env.GOOGLE_API_KEY,
// });

// ── ตัวเลือก C: DeepSeek (ใช้ ChatOpenAI ชี้ไปที่ baseURL ของ DeepSeek เพราะเป็นรูปแบบ OpenAI-compatible) ──
// import { ChatOpenAI } from "@langchain/openai";
// export const llm = new ChatOpenAI({
//   model: env.LLM_MODEL || "deepseek-flash",
//   apiKey: env.DEEPSEEK_API_KEY,
//   configuration: { baseURL: "https://api.deepseek.com" },
//   modelKwargs: { thinking: { type: "disabled" } }, // ปิดโหมดคิด ไม่งั้นบทที่ใช้ tool จะ error 400
// });

// ── ตัวเลือก D: OpenCode Go (ใช้ ChatOpenAI เพราะเป็นรูปแบบ OpenAI-compatible) ──
// import { randomUUID } from "node:crypto";
// import { ChatOpenAI } from "@langchain/openai";
// export const llm = new ChatOpenAI({
//   model: env.LLM_MODEL || "deepseek-v4.1-flash",
//   apiKey: env.OPENCODE_GO_KEY,
//   configuration: {
//     baseURL: "https://opencode.ai/zen/go/v1",
//     defaultHeaders: { "x-opencode-session": randomUUID() }, // เจ้านี้ต้องมี header นี้
//   },
// });

// ───────── ส่วนดูผล (ทำงานเฉพาะตอนรันไฟล์นี้ตรง ๆ ไม่ต้องแก้) ─────────
if (import.meta.filename === process.argv[1]) {
  const reply = await llm.invoke("ตอบสั้น ๆ ว่า สวัสดี");
  console.log("คำตอบ:", reply.text);
  console.log(reply.text ? "✅ ผ่าน: llm เรียกได้จริง บทอื่นจะ import { llm } จากไฟล์นี้" : "❌ ไม่ได้คำตอบกลับมา");
}
