import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// graph ตัวอย่างที่ langgraph dev เสิร์ฟ (ไม่ใช้โมเดล) ไม่ใส่ checkpointer เพราะเซิร์ฟเวอร์จัดให้เอง
const State = new StateSchema({
  question: z.string().default(""),
  answer: z.string().default(""),
  turns: z.number().default(0), // นับจำนวนรอบ: ค่าต้องค้างข้ามการรันใน thread เดียวกัน
});

export const graph = new StateGraph(State)
  .addNode("respond", (state) => ({ answer: `ตอบ: ${state.question}`, turns: state.turns + 1 }))
  .addEdge(START, "respond")
  .addEdge("respond", END)
  .compile();
