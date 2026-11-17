import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  name: z.string().default("ไม่ระบุชื่อ"),
  message: z.string().default(""),
});

// .compile() แปลง "แบบแปลน" เป็น graph ที่รันได้ แล้ว .invoke(input) รันและคืน state สุดท้าย
export function buildInvokeDemo() {
  return new StateGraph(State)
    .addNode("hello", (s) => ({ message: `สวัสดี ${s.name}` }))
    .addEdge(START, "hello")
    .addEdge("hello", END)
    .compile();
}
