import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

// รับคำตอบทีละชิ้นขณะ LLM กำลังพิมพ์
export async function collectStream(
  llm: BaseChatModel,
  prompt: string,
  onChunk?: (chunk: string) => void,
): Promise<string[]> {
  const chunks: string[] = [];
  for await (const chunk of await llm.stream(prompt)) {
    const text = String(chunk.content);
    chunks.push(text);
    onChunk?.(text);
  }
  return chunks;
}
