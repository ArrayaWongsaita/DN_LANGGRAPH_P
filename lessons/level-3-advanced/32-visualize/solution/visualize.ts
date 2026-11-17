import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({ n: z.number().default(0) });

export function buildSample() {
  return new StateGraph(State)
    .addNode("inc", (s) => ({ n: s.n + 1 }))
    .addNode("done", (s) => ({ n: s.n }))
    .addEdge(START, "inc")
    .addConditionalEdges("inc", (s) => (s.n >= 3 ? "done" : "inc"), ["inc", "done"])
    .addEdge("done", END)
    .compile();
}

type Sample = ReturnType<typeof buildSample>;

export async function toMermaid(graph: Sample): Promise<string> {
  const g = await graph.getGraphAsync();
  return g.drawMermaid();
}

export async function nodeNames(graph: Sample): Promise<string[]> {
  const g = await graph.getGraphAsync();
  return Object.keys(g.nodes).filter((n) => !n.startsWith("__"));
}
