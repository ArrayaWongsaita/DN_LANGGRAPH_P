import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Hit } from "@src/rag";
import { todo } from "@src/todo";
import { z } from "zod";

export const CitedAnswer = z.object({
  answer: z.string(),
  sources: z.array(z.string()),
});

export interface CheckedAnswer {
  answer: string;
  sources: string[];
  grounded: boolean;
}

export async function answerWithCitations(llm: BaseChatModel, question: string, hits: Hit[]): Promise<CheckedAnswer> {
  // 👉 ข้อ 1: context = hits ทุกชิ้นเป็นบรรทัด `[${source}] ${text}` ต่อกันด้วย "\n"
  //          แล้วเรียก llm.withStructuredOutput(CitedAnswer).invoke(`ตอบจากเอกสารเท่านั้นและระบุไฟล์ที่ใช้ใน sources\n${context}\nคำถาม: ${question}`)
  const result: z.infer<typeof CitedAnswer> = await todo(1);

  // 👉 ข้อ 2: กรอง result.sources ให้เหลือเฉพาะที่ตรงกับ source ของ hits จริง (กันการอ้างไฟล์ที่ไม่เคยได้รับ)
  const sources: string[] = todo(2);

  // 👉 ข้อ 3: grounded เป็นจริงเมื่อเหลือแหล่งที่ถูกต้องอย่างน้อยหนึ่งแหล่ง
  const grounded: boolean = todo(3);

  return { answer: result.answer, sources, grounded };
}
