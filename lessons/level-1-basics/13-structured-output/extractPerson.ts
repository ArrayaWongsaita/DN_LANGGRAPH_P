import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";

export const personSchema = z.object({ name: z.string(), age: z.number() });
export type Person = z.infer<typeof personSchema>;

// ขอให้ LLM ตอบเป็น JSON แล้วตรวจรูปร่างด้วย zod
// (Ollama Cloud ยังไม่รองรับ structured output แบบ native จึงใช้วิธีนี้)
export async function extractPerson(llm: BaseChatModel, text: string): Promise<Person> {
  const response = await llm.invoke(
    `ดึงชื่อและอายุจากข้อความนี้ ตอบเป็น JSON เท่านั้นในรูป {"name": string, "age": number}\n\n${text}`,
  );

  let data: unknown;
  try {
    data = JSON.parse(String(response.content));
  } catch {
    throw new Error("LLM ไม่ได้ตอบเป็น JSON ที่ถูกต้อง");
  }

  const parsed = personSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("JSON ที่ได้ไม่ตรงรูปแบบ Person (ต้องมี name เป็นข้อความ และ age เป็นตัวเลข)");
  }
  return parsed.data;
}
