import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { AIMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";

// token ทั้งหมดของคำตอบหนึ่งข้อความ (ไม่มีข้อมูลให้เป็น 0)
export function totalTokens(message: AIMessage): number {
  // 👉 ข้อ 1: คืน message.usage_metadata?.total_tokens ถ้าไม่มีให้คืน 0
  return todo(1);
}

// ถาม LLM หลายคำถาม คืนคำตอบทั้งหมดและ token รวมของทุกครั้ง
export async function askAll(
  llm: BaseChatModel,
  questions: string[],
): Promise<{ answers: string[]; tokens: number }> {
  const answers: string[] = [];
  let tokens = 0;
  for (const q of questions) {
    const reply = (await llm.invoke(q)) as AIMessage;
    answers.push(reply.text);
    // 👉 ข้อ 2: บวก totalTokens(reply) เข้า tokens
    todo(2);
  }
  return { answers, tokens };
}
