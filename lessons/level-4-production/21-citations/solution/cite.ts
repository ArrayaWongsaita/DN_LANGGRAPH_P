import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Hit } from "@src/rag";
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
  const context = hits.map((h) => `[${h.source}] ${h.text}`).join("\n");
  const result = await llm
    .withStructuredOutput(CitedAnswer)
    .invoke(`ตอบจากเอกสารเท่านั้นและระบุไฟล์ที่ใช้ใน sources\n${context}\nคำถาม: ${question}`);

  const known = new Set(hits.map((h) => h.source));
  const sources = result.sources.filter((s) => known.has(s));
  const grounded = sources.length > 0;

  return { answer: result.answer, sources, grounded };
}
