import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent, piiMiddleware } from "langchain";
import { todo } from "@src/todo";

export function buildPrivateAgent(llm: BaseChatModel) {
  // 👉 ข้อ 1: อีเมล: piiMiddleware("email", { strategy: "redact" })
  const email = todo(1);
  // 👉 ข้อ 2: บัตรเครดิต: piiMiddleware("credit_card", { strategy: "mask" })
  const card = todo(2);
  // 👉 ข้อ 3: เลขบัตรประชาชน 13 หลัก: piiMiddleware("thai_id", { detector: /\d{13}/g, strategy: "redact" })
  //          (detector ต้องมีแฟล็ก g)
  const thaiId = todo(3);
  return createAgent({ model: llm, tools: [], middleware: [email, card, thaiId] });
}

// agent เข้มงวด: เจออีเมลแล้วหยุดทันที (ให้ไว้แล้ว)
export function buildStrictAgent(llm: BaseChatModel) {
  return createAgent({ model: llm, tools: [], middleware: [piiMiddleware("email", { strategy: "block" })] });
}
