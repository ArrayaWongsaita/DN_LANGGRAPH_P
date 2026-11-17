import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  last: z.string().default(""),
  rounds: z.number().default(0),
});

// loop = edge ที่วนกลับมา node เดิม ต้องมีเงื่อนไขหยุดเสมอ (ที่นี่: LLM ตอบ OK หรือครบ maxRounds)
export function buildRefineLoop(llm: BaseChatModel, maxRounds: number) {
  return new StateGraph(State)
    .addNode("refine", async (s) => ({
      last: (await llm.invoke("ปรับปรุงงานให้ดีขึ้น ถ้าดีแล้วตอบ OK")).text,
      rounds: s.rounds + 1,
    }))
    .addEdge(START, "refine")
    .addConditionalEdges(
      "refine",
      (s) => (s.last.trim() === "OK" || s.rounds >= maxRounds ? END : "refine"),
      ["refine", END],
    )
    .compile();
}
