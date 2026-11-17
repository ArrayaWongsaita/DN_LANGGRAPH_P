import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent, piiMiddleware } from "langchain";

export function buildPrivateAgent(llm: BaseChatModel) {
  const email = piiMiddleware("email", { strategy: "redact" });
  const card = piiMiddleware("credit_card", { strategy: "mask" });
  const thaiId = piiMiddleware("thai_id", { detector: /\d{13}/g, strategy: "redact" });
  return createAgent({ model: llm, tools: [], middleware: [email, card, thaiId] });
}

export function buildStrictAgent(llm: BaseChatModel) {
  return createAgent({ model: llm, tools: [], middleware: [piiMiddleware("email", { strategy: "block" })] });
}
