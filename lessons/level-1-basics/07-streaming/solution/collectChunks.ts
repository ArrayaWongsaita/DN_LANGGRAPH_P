import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export async function collectChunks(llm: BaseChatModel, question: string): Promise<string[]> {
  const chunks: string[] = [];
  const stream = await llm.stream(question);
  for await (const chunk of stream) {
    chunks.push(chunk.text);
  }
  return chunks;
}
