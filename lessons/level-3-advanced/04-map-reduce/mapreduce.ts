import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  docs: z.array(z.string()).default(() => []),
  counts: new ReducedValue(z.array(z.number()).default(() => []), {
    inputSchema: z.number(),
    reducer: (current: number[], next: number) => [...current, next],
  }),
  total: z.number().default(0),
});

export function buildMapReduceGraph() {
  return new StateGraph(State)
    .addNode("countWords", (input: unknown) => {
      const { doc } = input as { doc: string };
      // 👉 ข้อ 2 (map): คืน { counts: จำนวนคำของ doc } โดยคำคั่นด้วยช่องว่าง (doc.split(" ").length)
      return todo(2);
    })
    .addNode("sum", (state) => {
      // 👉 ข้อ 3 (reduce): คืน { total: ผลรวมของ state.counts }
      return todo(3);
    })
    .addConditionalEdges(
      START,
      (state) => {
        // 👉 ข้อ 1: แตกงานหนึ่งอันต่อหนึ่งเอกสาร: new Send("countWords", { doc })
        return todo(1);
      },
      ["countWords"],
    )
    .addEdge("countWords", "sum")
    .addEdge("sum", END)
    .compile();
}
