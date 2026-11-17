import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  question: z.string(),
  path: z.string().default(""),
});

export function routeByLength(state: { question: string }): "short" | "long" {
  return state.question.length <= 20 ? "short" : "long";
}

export function buildRouteGraph() {
  const graph = new StateGraph(State)
    .addNode("short", () => ({ path: "short" }))
    .addNode("long", () => ({ path: "long" }));

  graph.addConditionalEdges(START, routeByLength, ["short", "long"]);
  graph.addEdge("short", END);
  graph.addEdge("long", END);

  return graph.compile();
}
