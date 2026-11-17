import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { todo } from "@src/todo";
import { z } from "zod";

export interface Candidate {
  id: string;
  text: string;
}

export function buildRerankPrompt(query: string, candidates: Candidate[]): string {
  // 👉 ข้อ 1: คืนข้อความที่มีคำถามและเอกสารเรียงเป็นบรรทัด `${เลขที่เริ่มจาก 1}. ${text}` ทุกอัน
  //          และบอกให้ให้คะแนนความเกี่ยวข้อง 0-10 ต่อเอกสาร ส่งกลับเป็น scores ตามลำดับเอกสาร
  return todo(1);
}

export async function rerank(
  llm: BaseChatModel,
  query: string,
  candidates: Candidate[],
  options: { topN: number; minScore: number },
): Promise<Candidate[]> {
  if (candidates.length === 0) return []; // ไม่มีอะไรให้จัด ไม่ต้องเรียกโมเดล
  const result = await llm
    .withStructuredOutput(z.object({ scores: z.array(z.number()) }))
    .invoke(buildRerankPrompt(query, candidates));

  // 👉 ข้อ 2: ถ้า result.scores.length ไม่เท่ากับจำนวน candidates (โมเดลตอบผิดรูป) ให้ถอยกลับ:
  //          คืน candidates.slice(0, options.topN) ตามลำดับเดิม โดยไม่กรองและไม่เรียงใหม่
  todo(2);

  // 👉 ข้อ 3: จับคู่ candidate กับคะแนนตามตำแหน่ง เก็บเฉพาะที่คะแนน >= options.minScore
  //          เรียงคะแนนมากไปน้อย (เท่ากันคงลำดับเดิม) แล้วเอา options.topN อันแรก คืนเป็น Candidate
  return todo(3);
}
