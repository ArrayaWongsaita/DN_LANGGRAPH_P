import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

export const CounterState = new StateSchema({
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
  score: new ReducedValue(z.number().default(0), {
    inputSchema: z.number(),
    reducer: (current: number, next: number) => current + next,
  }),
});

export function buildSequentialGraph() {
  return new StateGraph(CounterState)
    .addNode("a", () => ({ log: "a" }))
    .addNode("b", () => ({ log: "b" }))
    .addEdge(START, "a")
    .addEdge("a", "b")
    .addEdge("b", END)
    .compile();
}

export function buildParallelGraph() {
  return new StateGraph(CounterState)
    .addNode("x", () => ({ log: "x", score: 1 }))
    .addNode("y", () => ({ log: "y", score: 2 }))
    .addEdge(START, "x")
    .addEdge(START, "y")
    .addEdge("x", END)
    .addEdge("y", END)
    .compile();
}
