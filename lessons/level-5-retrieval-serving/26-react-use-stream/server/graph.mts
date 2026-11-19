import { END, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { z } from "zod";

// graph "order": เตรียม → หยุดรออนุมัติ (interrupt) → ผลลัพธ์ (ไม่ใช้โมเดล)
const State = new StateSchema({ item: z.string().default(""), note: z.string().default(""), result: z.string().default("") });

export const graph = new StateGraph(State)
  .addNode("prepare", (s) => ({ note: `เตรียม ${s.item} แล้ว` }))
  .addNode("approve", (s) => {
    const ok = interrupt({ question: `อนุมัติ ${s.item} ไหม` });
    return { result: ok ? `อนุมัติ ${s.item}` : "ไม่อนุมัติ" };
  })
  .addEdge(START, "prepare")
  .addEdge("prepare", "approve")
  .addEdge("approve", END)
  .compile();
