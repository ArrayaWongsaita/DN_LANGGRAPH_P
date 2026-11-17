import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AIMessage } from "@langchain/core/messages";

export function totalTokens(message: AIMessage): number {
  return message.usage_metadata?.total_tokens ?? 0;
}

export async function askAll(
  llm: BaseChatModel,
  questions: string[],
): Promise<{ answers: string[]; tokens: number }> {
  const answers: string[] = [];
  let tokens = 0;
  for (const q of questions) {
    const reply = (await llm.invoke(q)) as AIMessage;
    answers.push(reply.text);
    tokens += totalTokens(reply);
  }
  return { answers, tokens };
}
