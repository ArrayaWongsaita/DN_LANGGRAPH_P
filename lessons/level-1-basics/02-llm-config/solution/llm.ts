import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { check } from "@src/check";
import { env } from "../../01-env-schema/solution/env"; // (ในโปรเจกต์จริงของคุณคือ ../01-env-schema/env)
import { ChatGroq } from "@langchain/groq";

// รันด้วย: pnpm lesson 1-02
// เฉลย: เลือก Groq ตัวเลือกอื่นคอมเมนต์ไว้ (ถ้าใช้เจ้าอื่น ให้เปิดบล็อกของเจ้านั้นแทน และคอมเมนต์ Groq)
// export const llm มีได้ชื่อเดียว จึงเปิดไว้เจ้าเดียว

// ── ตัวเลือก A: Groq (เลือกอยู่) ──
export const llm: BaseChatModel = new ChatGroq({
  model: env.LLM_MODEL || "openai/gpt-oss-20b",
  apiKey: env.GROQ_API_KEY,
});

// ── ตัวเลือก B: Google (Gemini) ──
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// export const llm: BaseChatModel = new ChatGoogleGenerativeAI({
//   model: env.LLM_MODEL || "gemini-flash-lite-latest",
//   apiKey: env.GOOGLE_API_KEY,
// });

// ── ตัวเลือก C: DeepSeek (ใช้ ChatOpenAI ชี้ไปที่ baseURL ของ DeepSeek เพราะเป็นรูปแบบ OpenAI-compatible) ──
// import { ChatOpenAI } from "@langchain/openai";
// export const llm: BaseChatModel = new ChatOpenAI({
//   model: env.LLM_MODEL || "deepseek-flash",
//   apiKey: env.DEEPSEEK_API_KEY,
//   configuration: { baseURL: "https://api.deepseek.com" },
//   modelKwargs: { thinking: { type: "disabled" } }, // ปิดโหมดคิด ไม่งั้นบทที่ใช้ tool จะ error 400
// });

// ── ตัวเลือก D: OpenCode Go (ใช้ ChatOpenAI เพราะเป็นรูปแบบ OpenAI-compatible) ──
// import { randomUUID } from "node:crypto";
// import { ChatOpenAI } from "@langchain/openai";
// export const llm: BaseChatModel = new ChatOpenAI({
//   model: env.LLM_MODEL || "deepseek-v4.1-flash",
//   apiKey: env.OPENCODE_GO_KEY,
//   configuration: {
//     baseURL: "https://opencode.ai/zen/go/v1",
//     defaultHeaders: { "x-opencode-session": randomUUID() }, // เจ้านี้ต้องมี header นี้
//   },
// });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
if (import.meta.filename === process.argv[1]) {
  const configuredModel = llm.getLsParams({}).ls_model_name;
  console.log("โมเดล", configuredModel);
  check("สร้าง chat model สำเร็จและมีชื่อโมเดล", llm instanceof BaseChatModel && !!configuredModel, "เปิดตัวเลือกไว้เจ้าเดียวและตั้ง key ใน .env");
}
