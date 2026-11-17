import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, type BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";

export interface Example {
  input: string;
  output: string;
}

const SYSTEM = "จัดประเภทความรู้สึกของข้อความ ตอบคำเดียว: บวก หรือ ลบ";

// สร้างรายการข้อความ: system, (human, ai) ของทุกตัวอย่าง, แล้ว human ของคำถามจริง
export function buildFewShot(examples: Example[], input: string): BaseMessage[] {
  // 👉 ข้อ 1: คืน [new SystemMessage(SYSTEM), ...ตัวอย่างแต่ละตัวเป็น HumanMessage(input) + AIMessage(output), new HumanMessage(input)]
  return todo(1);
}

export async function classify(llm: BaseChatModel, examples: Example[], input: string): Promise<string> {
  // 👉 ข้อ 2: ส่ง buildFewShot(examples, input) ให้ llm.invoke แล้วคืน .text ที่ตัดช่องว่างหัวท้าย
  return todo(2);
}
