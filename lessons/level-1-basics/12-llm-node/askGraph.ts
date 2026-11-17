import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const State = new StateSchema({
  question: z.string(),
  answer: z.string().default(""),
});

// ชื่อ node ห้ามซ้ำกับชื่อ field ใน State (ที่นี่ field คือ question/answer จึงตั้งชื่อ node ว่า "ask")
export function buildAskGraph(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("ask", async (state) => {
      // 👉 ข้อ 1: ส่ง state.question ให้ llm แล้ว "รอ" ผลลัพธ์
      // แนวทาง: const reply = await llm.invoke(state.question);
      const reply = todo(1);

      // 👉 ข้อ 2: คืน update ของ answer ซึ่งเป็นข้อความตอบ (reply.text)
      return todo(2);
    })
    .addEdge(START, "ask")
    .addEdge("ask", END)
    .compile();
}
