import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { type BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";

// LLM "จำอะไรไม่ได้เลย" ทุกครั้งที่เรียก เราต้องส่งบทสนทนาทั้งหมดไปให้ใหม่เสมอ
export async function askWithHistory(
  llm: BaseChatModel,
  system: string,
  history: BaseMessage[],
  question: string,
): Promise<string> {
  // 👉 ข้อ 1: สร้าง array ข้อความตามลำดับ: SystemMessage(system), ตามด้วยข้อความใน history ทั้งหมด,
  //          แล้วปิดท้ายด้วย HumanMessage(question)
  // แนวทาง: [new SystemMessage(system), ...history, new HumanMessage(question)]
  const messages = todo(1);

  // 👉 ข้อ 2: ส่ง messages ให้ LLM แล้วคืนข้อความตอบ (.text)
  return todo(2);
}
