import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";
import { todo } from "@src/todo";

// รูปร่างข้อมูลที่เราอยากได้ (บอกด้วย zod)
export const personSchema = z.object({ name: z.string(), age: z.number() });
export type Person = z.infer<typeof personSchema>;

// ดึงชื่อและอายุจากข้อความ ให้ LLM ตอบกลับมาเป็น object ตาม personSchema
export async function extractPerson(llm: BaseChatModel, text: string): Promise<Person> {
  // 👉 ข้อ 1: ทำให้ llm ตอบเป็นโครงสร้างตาม personSchema
  // แนวทาง: llm.withStructuredOutput(personSchema) จะคืน "ตัวเรียก" ตัวใหม่ที่ตอบเป็น object
  const structured = todo(1);

  // 👉 ข้อ 2: เรียก structured ด้วยข้อความที่มี text แล้วคืนผลลัพธ์
  // แนวทาง: structured.invoke(`ดึงชื่อและอายุจากข้อความนี้: ${text}`)
  return todo(2);
}
