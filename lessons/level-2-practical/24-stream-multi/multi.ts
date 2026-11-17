import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({ pages: z.number().default(0), done: z.string().default("") });

// graph จากบท 2-23 (ย่อไว้ให้)
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

// คืนรายการข้อความตามลำดับเวลา เช่น ["custom:1", "custom:2", "updates:crawl"]
export async function timeline(pages: number): Promise<string[]> {
  const graph = buildCrawlGraph();
  const out: string[] = [];
  // 👉 ข้อ 1: วน for await (const [mode, data] of await graph.stream({ pages }, { streamMode: ["updates", "custom"] }))
  // 👉 ข้อ 2: ถ้า mode เป็น "custom" push `custom:${data.page}` ถ้าเป็น "updates" push `updates:${Object.keys(data)[0]}`
  return todo(1);
}
