import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

// State ที่ใช้ร่วมกัน (ทั้งแม่และลูกมี field text)
const TextState = new StateSchema({ text: z.string().default(""), length: z.number().default(0) });

export const normalize = new StateGraph(TextState)
  .addNode("clean", (s) => ({ text: s.text.trim().toLowerCase() }))
  .addEdge(START, "clean")
  .addEdge("clean", END)
  .compile();

export function buildPipeline() {
  const builder = new StateGraph(TextState);
  // 👉 ข้อ 1: เพิ่ม subgraph เป็น node ชื่อ "normalize" (builder.addNode("normalize", normalize))
  //          แล้วต่อ START → normalize → measure → END  (measure ด้านล่างคือ node วัดความยาว)
  return todo(1);
}

export const measure = (s: { text: string }) => ({ length: s.text.length });
