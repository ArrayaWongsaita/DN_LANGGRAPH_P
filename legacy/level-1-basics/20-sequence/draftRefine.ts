import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  topic: z.string().default(""),
  draft: z.string().default(""),
  final: z.string().default(""),
});

// เขียนร่าง -> ปรับปรุง: node ที่สองอ่านผลของ node แรกจาก state
// หมายเหตุ: ชื่อ node ห้ามซ้ำกับชื่อ field ใน state (เลยไม่ตั้งชื่อ node ว่า draft)
export function buildDraftRefineGraph(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("writeDraft", async (s) => ({
      draft: (await llm.invoke(`เขียนประโยคสั้น ๆ เกี่ยวกับ ${s.topic}`)).text,
    }))
    .addNode("improve", async (s) => ({
      final: (await llm.invoke(`ปรับประโยคนี้ให้ดีขึ้น: ${s.draft}`)).text,
    }))
    .addEdge(START, "writeDraft")
    .addEdge("writeDraft", "improve")
    .addEdge("improve", END)
    .compile();
}
