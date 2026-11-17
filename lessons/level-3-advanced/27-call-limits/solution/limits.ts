import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { createAgent, modelCallLimitMiddleware, toolCallLimitMiddleware } from "langchain";

export function agentWithModelLimit(llm: BaseChatModel, tools: StructuredToolInterface[], runLimit: number) {
  return createAgent({
    model: llm,
    tools,
    middleware: [modelCallLimitMiddleware({ runLimit, exitBehavior: "end" })],
  });
}

export function agentWithToolLimit(llm: BaseChatModel, tools: StructuredToolInterface[], runLimit: number) {
  return createAgent({ model: llm, tools, middleware: [toolCallLimitMiddleware({ runLimit })] });
}
