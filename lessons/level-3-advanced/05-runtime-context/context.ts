import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({ out: z.string().default("") });

export function buildContextGraph() {
  // 👉 ข้อ 1: ส่ง options ที่สองให้ StateGraph: { context: z.object({ lang: z.string().optional() }) }
  const builder = todo(1);
  return builder
    .addNode("greet", (state, runtime) => {
      // 👉 ข้อ 2: คืน { out: "Hello" } ถ้า runtime.context?.lang เป็น "en" ไม่เช่นนั้นคืน { out: "สวัสดี" }
      return todo(2);
    })
    .addEdge(START, "greet")
    .addEdge("greet", END)
    .compile();
}
