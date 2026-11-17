import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

export function buildDeferGraph() {
  return new StateGraph(State)
    .addNode("a", () => ({ log: "a" }))
    .addNode("b1", () => ({ log: "b1" }))
    .addNode("b2", () => ({ log: "b2" }))
    .addNode("b3", () => ({ log: "b3" }))
    .addNode("final", () => ({ log: "final" }), { defer: true })
    .addEdge(START, "a")
    .addEdge(START, "b1")
    .addEdge("a", "b2")
    .addEdge("b2", "b3")
    .addEdge("b1", "final")
    .addEdge("b3", "final")
    .addEdge("final", END)
    .compile();
}
