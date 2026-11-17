import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";

export interface Candidate {
  id: string;
  text: string;
}

export function buildRerankPrompt(query: string, candidates: Candidate[]): string {
  const lines = candidates.map((c, i) => `${i + 1}. ${c.text}`).join("\n");
  return `คำถาม: ${query}\nเอกสาร:\n${lines}\nให้คะแนนความเกี่ยวข้องของแต่ละเอกสารกับคำถาม 0-10 ส่งกลับเป็น scores ตามลำดับเอกสาร`;
}

export async function rerank(
  llm: BaseChatModel,
  query: string,
  candidates: Candidate[],
  options: { topN: number; minScore: number },
): Promise<Candidate[]> {
  if (candidates.length === 0) return [];
  const result = await llm
    .withStructuredOutput(z.object({ scores: z.array(z.number()) }))
    .invoke(buildRerankPrompt(query, candidates));

  if (result.scores.length !== candidates.length) return candidates.slice(0, options.topN);

  return candidates
    .map((candidate, index) => ({ candidate, index, score: result.scores[index] }))
    .filter((x) => x.score >= options.minScore)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, options.topN)
    .map((x) => x.candidate);
}
