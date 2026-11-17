import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  pages: z.number().default(0),
  done: z.string().default(""),
});

export function buildCrawlGraph() {
  return new StateGraph(State)
    .addNode("crawl", (state, config) => {
      for (let i = 1; i <= state.pages; i++) {
        // 👉 ข้อ 1: ส่งความคืบหน้าหลังประมวลผลหน้าที่ i: config.writer?.({ page: i, total: state.pages })
        todo(1);
      }
      return { done: `ครบ ${state.pages} หน้า` };
    })
    .addEdge(START, "crawl")
    .addEdge("crawl", END)
    .compile();
}

type CrawlGraph = ReturnType<typeof buildCrawlGraph>;

// คืนรายการความคืบหน้าที่ node ส่งออกมา (เป็นข้อความ "i/total")
export async function collectProgress(graph: CrawlGraph, pages: number): Promise<string[]> {
  const seen: string[] = [];
  // 👉 ข้อ 2: for await (const c of await graph.stream({ pages }, { streamMode: "custom" }))
  //          แต่ละ c คือ { page, total } ให้ push `${c.page}/${c.total}` ลง seen
  return todo(2);
}
