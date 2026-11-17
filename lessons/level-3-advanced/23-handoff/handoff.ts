import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const S = new StateSchema({
  message: z.string().default(""),
  log: z.string().default(""),
});

// sales เป็น subgraph: ถ้าลูกค้าพูดถึง "พัง" ให้ส่งต่อ support ไม่เช่นนั้นตอบเอง
const sales = new StateGraph(S)
  .addNode("handle", (state) => {
    if (state.message.includes("พัง")) {
      // 👉 ข้อ 1: คืน new Command({ update: { log: `${state.log}sales→support;` }, goto: "support", graph: Command.PARENT })
      return todo(1);
    }
    return { log: `${state.log}sales ตอบเอง;` };
  })
  .addEdge(START, "handle")
  .compile();

export function buildTeam() {
  return new StateGraph(S)
    .addNode("support", (state) => ({ log: `${state.log}support รับช่วง;` }))
    // 👉 ข้อ 2: เพิ่ม sales เป็น node พร้อมประกาศปลายทางที่ส่งต่อได้ { ends: ["support"] }
    .addEdge(START, "sales")
    .addEdge("support", END)
    .compile();
}
