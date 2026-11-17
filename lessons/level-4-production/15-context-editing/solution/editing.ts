import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent, ClearToolUsesEdit, contextEditingMiddleware } from "langchain";
import { makeAddTool } from "@src/sampleTools";

export function buildEditingAgent(llm: BaseChatModel) {
  const edit = new ClearToolUsesEdit({ trigger: { tokens: 1 }, keep: { messages: 1 }, placeholder: "[ล้างแล้ว]" });
  const middleware = contextEditingMiddleware({ edits: [edit] });
  return createAgent({ model: llm, tools: [makeAddTool()], middleware: [middleware] });
}
