import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({ pages: z.number().default(0), done: z.string().default("") });

function buildCrawlGraph() {
  return new StateGraph(State)
    .addNode("crawl", (state, config) => {
      for (let i = 1; i <= state.pages; i++) config.writer?.({ page: i });
      return { done: `ครบ ${state.pages} หน้า` };
    })
    .addEdge(START, "crawl")
    .addEdge("crawl", END)
    .compile();
}

export async function timeline(pages: number): Promise<string[]> {
  const graph = buildCrawlGraph();
  const out: string[] = [];
  for await (const [mode, data] of await graph.stream({ pages }, { streamMode: ["updates", "custom"] })) {
    if (mode === "custom") out.push(`custom:${(data as { page: number }).page}`);
    if (mode === "updates") out.push(`updates:${Object.keys(data)[0]}`);
  }
  return out;
}
