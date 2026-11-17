import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, summarizationMiddleware } from "langchain";

export function buildSummarizingAgent(llm: BaseChatModel, summaryLlm: BaseChatModel) {
  const summarizer = summarizationMiddleware({ model: summaryLlm, trigger: { messages: 4 }, keep: { messages: 2 } });
  return createAgent({ model: llm, tools: [], checkpointer: new MemorySaver(), middleware: [summarizer] });
}

export async function say(agent: ReturnType<typeof buildSummarizingAgent>, text: string) {
  return agent.invoke({ messages: [new HumanMessage(text)] }, { configurable: { thread_id: "t" } });
}
