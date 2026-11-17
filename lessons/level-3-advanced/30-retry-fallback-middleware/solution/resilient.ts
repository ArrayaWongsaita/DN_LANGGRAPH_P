import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { createAgent, createMiddleware, modelFallbackMiddleware, modelRetryMiddleware } from "langchain";

export function buildResilientAgent(primary: BaseChatModel, backup: BaseChatModel, seen: number[]) {
  const retry = modelRetryMiddleware({ maxRetries: 3, initialDelayMs: 1, jitter: false, onFailure: "error" });
  const fallback = modelFallbackMiddleware(backup);
  const logger = createMiddleware({
    name: "logger",
    beforeModel: async (state) => {
      seen.push(state.messages.length);
      return undefined;
    },
  });
  return createAgent({ model: primary, tools: [], middleware: [logger, fallback, retry] });
}

export async function ask(agent: ReturnType<typeof buildResilientAgent>, text: string): Promise<string> {
  const r = await agent.invoke({ messages: [new HumanMessage(text)] });
  return r.messages[r.messages.length - 1].text;
}
