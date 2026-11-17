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
      const reply = await llm.invoke("ปรับปรุงงานให้ดีขึ้น ถ้าดีแล้วตอบว่า OK");
      return { last: reply.text, rounds: state.rounds + 1 };
    })
    .addEdge(START, "refine");

  graph.addConditionalEdges("refine", (s) => shouldContinue(s, maxRounds), ["refine", END]);

  return graph.compile();
}
