import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { type Hit, InMemoryIndex } from "@src/rag";
import { z } from "zod";

export function formatHits(hits: Hit[]): string {
  const useful = hits.filter((h) => h.score > 0);
  if (useful.length === 0) return "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร";
  return useful.map((h) => `[${h.source}] ${h.text}`).join("\n");
}

export function makeSearchTool(index: InMemoryIndex) {
  return tool(
    async ({ query }: { query: string }) => formatHits(await index.search(query, 2)),
    {
      name: "search_docs",
      description: "ค้นเอกสารภายในบริษัท (นโยบาย, IT, การคืนสินค้า) ใช้เมื่อคำถามต้องการข้อมูลจากเอกสาร",
      schema: z.object({ query: z.string() }),
    },
  );
}

export function buildRagAgent(llm: BaseChatModel, index: InMemoryIndex) {
  return createAgent({
    model: llm,
    tools: [makeSearchTool(index)],
    systemPrompt: "ตอบจากผลของ search_docs เท่านั้น ถ้าไม่พบให้บอกตรง ๆ ว่าไม่พบ ไม่ต้องเดา",
  });
}
