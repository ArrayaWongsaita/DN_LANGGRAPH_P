import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// graph "demo" บนเซิร์ฟเวอร์ปลายทาง (ไม่ใช้โมเดล): ตอบโดยนับรอบใน thread
const State = new StateSchema({ question: z.string().default(""), answer: z.string().default(""), turns: z.number().default(0) });

export const graph = new StateGraph(State)
  .addNode("respond", (s) => ({ answer: `[รอบ ${s.turns + 1}] ตอบ: ${s.question}`, turns: s.turns + 1 }))
  .addEdge(START, "respond")
  .addEdge("respond", END)
  .compile();
