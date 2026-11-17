import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent, ClearToolUsesEdit, contextEditingMiddleware } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { todo } from "@src/todo";

export function buildEditingAgent(llm: BaseChatModel) {
  // 👉 ข้อ 1: edit = new ClearToolUsesEdit({ trigger: { tokens: 1 }, keep: { messages: 1 }, placeholder: "[ล้างแล้ว]" })
  const edit = todo(1);
  // 👉 ข้อ 2: middleware = contextEditingMiddleware({ edits: [edit] })
  const middleware = todo(2);
  return createAgent({ model: llm, tools: [makeAddTool()], middleware: [middleware] });
}
