import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

// subgraph: นับคำ (State ของมันคือ text / wc)
const CounterState = new StateSchema({ text: z.string().default(""), wc: z.number().default(0) });
export const counter = new StateGraph(CounterState)
  .addNode("count", (s) => ({ wc: s.text.split(" ").length }))
  .addEdge(START, "count")
  .addEdge("count", END)
  .compile();

// graph แม่: State คนละหน้าตา (doc / count)
const ParentState = new StateSchema({ doc: z.string().default(""), count: z.number().default(0) });

export function buildParent() {
  return new StateGraph(ParentState)
    .addNode("callCounter", async (state) => {
      // 👉 ข้อ 1: เรียก counter.invoke({ text: state.doc }) แล้วคืน { count: ผล.wc }
      return todo(1);
    })
    .addEdge(START, "callCounter")
    .addEdge("callCounter", END)
    .compile();
}
