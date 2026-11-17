import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { InMemoryCache } from "@langchain/langgraph-checkpoint";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  q: z.string().default(""),
  out: z.string().default(""),
});

export function buildCachedGraph(counter: { runs: number }) {
  return new StateGraph(State)
    .addNode(
      "expensive",
      (state) => {
        counter.runs++;
        return { out: `${state.q}!` };
      },
      // 👉 ข้อ 1: ตั้ง options ของ node: { cachePolicy: { ttl: 60 } }
      todo(1),
    )
    .addEdge(START, "expensive")
    .addEdge("expensive", END)
    // 👉 ข้อ 2: compile พร้อมตัวเก็บแคช: .compile({ cache: new InMemoryCache() })
    .compile();
}
