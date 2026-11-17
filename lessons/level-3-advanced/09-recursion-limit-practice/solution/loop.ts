import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { GraphRecursionError } from "@langchain/langgraph";

const State = new StateSchema({
  n: z.number().default(0),
  target: z.number().default(0),
});

export function buildLoopGraph() {
  return new StateGraph(State)
    .addNode("inc", (state) => ({ n: state.n + 1 }))
    .addEdge(START, "inc")
    .addConditionalEdges("inc", (state) => (state.n >= state.target ? END : "inc"), ["inc", END])
    .compile();
}

export function limitForRounds(target: number): number {
  return target + 2;
}

export type LoopResult = { ok: true; n: number } | { ok: false; reason: string };

export async function runLoop(target: number, limit = limitForRounds(target)): Promise<LoopResult> {
  const graph = buildLoopGraph();
  try {
    const r = await graph.invoke({ target }, { recursionLimit: limit });
    return { ok: true, n: r.n };
  } catch (e) {
    if (e instanceof GraphRecursionError) return { ok: false, reason: "วนเกินเพดาน" };
    throw e;
  }
}
