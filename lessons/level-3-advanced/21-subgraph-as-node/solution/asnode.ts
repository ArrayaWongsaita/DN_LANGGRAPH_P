import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const TextState = new StateSchema({ text: z.string().default(""), length: z.number().default(0) });

export const normalize = new StateGraph(TextState)
  .addNode("clean", (s) => ({ text: s.text.trim().toLowerCase() }))
  .addEdge(START, "clean")
  .addEdge("clean", END)
  .compile();

export const measure = (s: { text: string }) => ({ length: s.text.length });

export function buildPipeline() {
  return new StateGraph(TextState)
    .addNode("normalize", normalize)
    .addNode("measure", measure)
    .addEdge(START, "normalize")
    .addEdge("normalize", "measure")
    .addEdge("measure", END)
    .compile();
}
