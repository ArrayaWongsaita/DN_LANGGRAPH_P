import { HumanMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent } from "langchain";
import { makeAddTool } from "@src/sampleTools";

export function buildCalculator(model: BaseChatModel) {
  return createAgent({ model, tools: [makeAddTool()] });
}

export async function ask(agent: ReturnType<typeof buildCalculator>, question: string): Promise<string> {
  try {
    const result = await agent.invoke({ messages: [new HumanMessage(question)] });
    return result.messages[result.messages.length - 1].text;
  } catch {
    return "ขออภัย ระบบขัดข้อง";
  }
}
