import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  items: z.array(z.string()).default(() => []),
  out: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

export function buildFanoutGraph() {
  return new StateGraph(State)
    .addNode("work", (input: unknown) => {
      const { item } = input as { item: string };
      // 👉 ข้อ 2: คืน { out: item.toUpperCase() }
      return todo(2);
    })
    .addConditionalEdges(
      START,
      (state) => {
        // 👉 ข้อ 1: คืนรายการ Send หนึ่งอันต่อหนึ่ง item: new Send("work", { item })
        return todo(1);
      },
      ["work"],
    )
    .addEdge("work", END)
    .compile();
}
