import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { createAgent, modelCallLimitMiddleware, toolCallLimitMiddleware } from "langchain";
import { todo } from "@src/todo";

// จำกัดจำนวนครั้งที่เรียกโมเดล (เกินแล้วจบอย่างนุ่มนวล)
export function agentWithModelLimit(llm: BaseChatModel, tools: StructuredToolInterface[], runLimit: number) {
  // 👉 ข้อ 1: createAgent({ model: llm, tools, middleware: [modelCallLimitMiddleware({ runLimit, exitBehavior: "end" })] })
  return todo(1);
}

// จำกัดจำนวนครั้งที่เรียก tool
export function agentWithToolLimit(llm: BaseChatModel, tools: StructuredToolInterface[], runLimit: number) {
  // 👉 ข้อ 2: createAgent({ model: llm, tools, middleware: [toolCallLimitMiddleware({ runLimit })] })
  return todo(2);
}
