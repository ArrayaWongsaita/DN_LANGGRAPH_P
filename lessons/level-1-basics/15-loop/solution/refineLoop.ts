import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  last: z.string().default(""),
  rounds: z.number().default(0),
});
type LoopState = typeof State.State;

export function shouldContinue(state: Pick<LoopState, "last" | "rounds">, maxRounds: number): "refine" | typeof END {
  return state.last.trim() === "OK" || state.rounds >= maxRounds ? END : "refine";
}

export function buildRefineLoop(llm: BaseChatModel, maxRounds: number) {
  const graph = new StateGraph(State)
    .addNode("refine", async (state) => {
      const reply = await llm.invoke(`ปรับปรุงข้อความนี้ให้ดีขึ้น ตอบด้วยข้อความที่ปรับปรุงแล้วเท่านั้น แต่ถ้าดีอยู่แล้วให้ตอบคำว่า OK คำเดียว:\n${state.last || "แมวกินปลา"}`);
      return { last: reply.text, rounds: state.rounds + 1 };
    })
    .addEdge(START, "refine");

  graph.addConditionalEdges("refine", (s) => shouldContinue(s, maxRounds), ["refine", END]);

  return graph.compile();
}
