import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { type Hit, InMemoryIndex } from "@src/rag";
import { todo } from "@src/todo";
import { z } from "zod";

// จัดรูปผลค้นหาเป็นข้อความให้โมเดลอ่าน
export function formatHits(hits: Hit[]): string {
  // 👉 ข้อ 1: กรองเฉพาะ hit ที่ score > 0 แล้วทำเป็นบรรทัดละชิ้น `[${source}] ${text}` ต่อกันด้วย "\n"
  //          ถ้าไม่เหลือสักชิ้น คืน "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร"
  return todo(1);
}

export function makeSearchTool(index: InMemoryIndex) {
  return tool(
    async ({ query }: { query: string }) => {
      // 👉 ข้อ 2: คืน formatHits(await index.search(query, 2))
      return todo(2);
    },
    {
      name: "search_docs",
      description: "ค้นเอกสารภายในบริษัท (นโยบาย, IT, การคืนสินค้า) ใช้เมื่อคำถามต้องการข้อมูลจากเอกสาร",
      schema: z.object({ query: z.string() }),
    },
  );
}

export function buildRagAgent(llm: BaseChatModel, index: InMemoryIndex) {
  // 👉 ข้อ 3: คืน createAgent({ model: llm, tools: [makeSearchTool(index)],
  //                              systemPrompt: "ตอบจากผลของ search_docs เท่านั้น ถ้าไม่พบให้บอกตรง ๆ ว่าไม่พบ ไม่ต้องเดา" })
  return todo(3);
}
