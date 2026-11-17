import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { type BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function askWithHistory(
  llm: BaseChatModel,
  system: string,
  history: BaseMessage[],
  question: string,
): Promise<string> {
  const messages = [new SystemMessage(system), ...history, new HumanMessage(question)];
  const reply = await llm.invoke(messages);
  return reply.text;
}
