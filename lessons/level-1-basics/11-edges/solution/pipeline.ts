import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  trace: z.string().default(""),
});

export function buildPipeline() {
  const graph = new StateGraph(State)
    .addNode("first", (s) => ({ trace: s.trace ? `${s.trace}>first` : "first" }))
    .addNode("second", (s) => ({ trace: s.trace ? `${s.trace}>second` : "second" }));

  graph.addEdge(START, "first");
  graph.addEdge("first", "second");
  graph.addEdge("second", END);

  return graph.compile();
}
