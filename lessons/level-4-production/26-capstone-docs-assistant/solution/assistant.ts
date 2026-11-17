import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseCheckpointSaver } from "@langchain/langgraph";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { InMemoryIndex } from "@src/rag";
import { z } from "zod";

export const BANNED = ["เจาะระบบ", "สร้างอาวุธ"];
export const REFUSAL = "ขออภัย ช่วยเรื่องนี้ไม่ได้";
export const NOT_FOUND = "ไม่พบข้อมูลในเอกสาร";

const Cited = z.object({ answer: z.string(), sources: z.array(z.string()) });

const State = new StateSchema({
  question: z.string().default(""),
  blocked: z.boolean().default(false),
  hits: z.array(z.object({ source: z.string(), text: z.string(), score: z.number() })).default(() => []),
  answer: z.string().default(""),
  sources: z.array(z.string()).default(() => []),
});

export function buildAssistant(llm: BaseChatModel, index: InMemoryIndex, checkpointer: BaseCheckpointSaver) {
  return new StateGraph(State)
    .addNode("guard", (state) => {
      if (BANNED.some((word) => state.question.includes(word))) return { blocked: true, answer: REFUSAL };
      return { blocked: false };
    })
    .addNode("retrieve", async (state) => {
      const hits = (await index.search(state.question, 2)).filter((h) => h.score > 0);
      return { hits };
    })
    .addNode("respond", async (state) => {
      const context = state.hits.map((h) => `[${h.source}] ${h.text}`).join("\n");
      const result = await llm
        .withStructuredOutput(Cited)
        .invoke(`ตอบจากเอกสารเท่านั้นและระบุไฟล์ที่ใช้ใน sources\n${context}\nคำถาม: ${state.question}`);
      const known = new Set(state.hits.map((h) => h.source));
      const sources = result.sources.filter((s) => known.has(s));
      if (sources.length > 0) return { answer: result.answer, sources };
      return { answer: NOT_FOUND, sources: [] };
    })
    .addNode("notFound", () => ({ answer: NOT_FOUND, sources: [] }))
    .addEdge(START, "guard")
    .addConditionalEdges(
      "guard",
      (state) => (state.blocked ? "end" : "retrieve"),
      { end: END, retrieve: "retrieve" },
    )
    .addConditionalEdges("retrieve", (state) => (state.hits.length > 0 ? "respond" : "notFound"), ["respond", "notFound"])
    .addEdge("respond", END)
    .addEdge("notFound", END)
    .compile({ checkpointer });
}
