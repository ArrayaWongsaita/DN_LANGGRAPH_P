import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  pages: z.number().default(0),
  done: z.string().default(""),
});

export function buildCrawlGraph() {
  return new StateGraph(State)
    .addNode("crawl", (state, config) => {
      for (let i = 1; i <= state.pages; i++) {
        config.writer?.({ page: i, total: state.pages });
      }
      return { done: `ครบ ${state.pages} หน้า` };
    })
    .addEdge(START, "crawl")
    .addEdge("crawl", END)
    .compile();
}

type CrawlGraph = ReturnType<typeof buildCrawlGraph>;

export async function collectProgress(graph: CrawlGraph, pages: number): Promise<string[]> {
  const seen: string[] = [];
  for await (const c of await graph.stream({ pages }, { streamMode: "custom" })) {
    seen.push(`${c.page}/${c.total}`);
  }
  return seen;
}
