import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export async function askOnce(llm: BaseChatModel, question: string): Promise<string> {
  const reply = await llm.invoke(question);
  return reply.text;
}
