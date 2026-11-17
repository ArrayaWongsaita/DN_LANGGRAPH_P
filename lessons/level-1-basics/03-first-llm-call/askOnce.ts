import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { todo } from "@src/todo";

// ถามคำถามเดียว ได้คำตอบเป็นข้อความ
export async function askOnce(llm: BaseChatModel, question: string): Promise<string> {
  // 👉 ข้อ 1: ส่ง question ให้ LLM แล้ว "รอ" ผลลัพธ์
  // แนวทาง: const reply = await llm.invoke(question);
  const reply = todo(1);

  // 👉 ข้อ 2: คืนเฉพาะ "ข้อความ" ของคำตอบ (reply เป็น object ข้อความ ไม่ใช่ string ตรง ๆ)
  // แนวทาง: reply.text
  return todo(2);
}
