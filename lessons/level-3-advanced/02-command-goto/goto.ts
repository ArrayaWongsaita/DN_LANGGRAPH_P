import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const State = new StateSchema({
  amount: z.number().default(0),
  log: z.string().default(""),
});

export function buildGotoGraph() {
  return new StateGraph(State)
    .addNode(
      "triage",
      (state) => {
        // 👉 ข้อ 1: คืน new Command({ update: { log: "triage" }, goto: ... })
        //          goto เป็น "premium" ถ้า state.amount >= 1000 ไม่เช่นนั้น "basic"
        return todo(1);
      },
      // 👉 ข้อ 2: ประกาศปลายทางที่เป็นไปได้ด้วย { ends: ["premium", "basic"] }
    )
    .addNode("premium", (state) => ({ log: `${state.log}>premium` }))
    .addNode("basic", (state) => ({ log: `${state.log}>basic` }))
    .addEdge(START, "triage")
    .addEdge("premium", END)
    .addEdge("basic", END)
    .compile();
}
