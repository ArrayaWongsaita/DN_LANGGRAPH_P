import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const Full = new StateSchema({
  question: z.string().default(""),
  scratch: z.string().default(""), // ส่วนตัว: ใช้ระหว่าง node เท่านั้น
  answer: z.string().default(""),
});
const In = new StateSchema({ question: z.string() });
const Out = new StateSchema({ answer: z.string() });

export function buildSchemaGraph() {
  // 👉 ข้อ 1: ประกอบ StateGraph ด้วย { state: Full, input: In, output: Out }
  const builder = todo(1);
  return builder
    .addNode("think", (state) => {
      // 👉 ข้อ 2: คืน { scratch: `คิดเรื่อง: ${state.question}`, answer: `คำตอบของ: ${state.question}` }
      return todo(2);
    })
    .addEdge(START, "think")
    .addEdge("think", END)
    .compile();
}
