import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";

export async function describeReply(
  llm: BaseChatModel,
  question: string,
): Promise<{ type: string; text: string }> {
  const reply = await llm.invoke([new HumanMessage(question)]);
  return { type: reply.type, text: reply.text };
}
