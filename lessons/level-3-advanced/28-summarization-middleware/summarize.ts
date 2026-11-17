import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, summarizationMiddleware } from "langchain";
import { todo } from "@src/todo";

export function buildSummarizingAgent(llm: BaseChatModel, summaryLlm: BaseChatModel) {
  // 👉 ข้อ 1: สร้าง middleware: summarizationMiddleware({ model: summaryLlm, trigger: { messages: 4 }, keep: { messages: 2 } })
  const summarizer = todo(1);
  // 👉 ข้อ 2: createAgent({ model: llm, tools: [], checkpointer: new MemorySaver(), middleware: [summarizer] })
  return todo(2);
}

export async function say(agent: ReturnType<typeof buildSummarizingAgent>, text: string) {
  return agent.invoke({ messages: [new HumanMessage(text)] }, { configurable: { thread_id: "t" } });
}
