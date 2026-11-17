import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

// ถาม LLM หนึ่งครั้ง แล้วคืนคำตอบเป็น string
export async function askOnce(llm: BaseChatModel, question: string): Promise<string> {
  const response = await llm.invoke(question);
  return response.text;
}
