import type { AIMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 12
const State = new StateSchema({
  question: z.string(),
  answer: z.string().default(""),
});

// ชื่อ node ห้ามซ้ำกับชื่อ field ใน State (ที่นี่ field คือ question/answer จึงตั้งชื่อ node ว่า "ask")
const graph = new StateGraph(State)
  .addNode("ask", async (state) => {
    // 👉 ข้อ 1: ส่ง state.question ให้ llm แล้ว "รอ" ผลลัพธ์
    // แนวทาง: const reply = await llm.invoke(state.question);
    const reply: AIMessage = todo(1);

    // 👉 ข้อ 2: คืน update ของ answer ซึ่งเป็นข้อความตอบ (reply.text)
    return todo(2);
  })
  .addEdge(START, "ask")
  .addEdge("ask", END)
  .compile();

const result = await graph.invoke({ question: "LangGraph ใช้ทำอะไร ตอบสั้น ๆ หนึ่งประโยค" });
console.log(result.answer);
check("state.answer เป็นข้อความที่ไม่ว่าง", typeof result.answer === "string" && result.answer.length > 0, "ลืม await หรือ .text หรือเปล่า?");
check("state.question ยังอยู่ครบ", result.question.length > 0);
