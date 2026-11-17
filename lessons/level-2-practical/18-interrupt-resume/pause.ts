import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const State = new StateSchema({
  action: z.string().default(""),
  decision: z.string().default(""),
  result: z.string().default(""),
});

export function buildPauseGraph() {
  return new StateGraph(State)
    .addNode("ask", (state) => {
      // 👉 ข้อ 1: เรียก interrupt({ question: "อนุมัติไหม?", action: state.action }) แล้วเก็บค่าที่ได้เป็น decision
      //          แนวทาง: const answer = interrupt({...}); return { decision: String(answer) };
      return todo(1);
    })
    .addNode("act", (state) => ({
      result: state.decision === "yes" ? `ทำแล้ว: ${state.action}` : `ยกเลิก: ${state.action}`,
    }))
    .addEdge(START, "ask")
    .addEdge("ask", "act")
    .addEdge("act", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type PauseGraph = ReturnType<typeof buildPauseGraph>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

// เริ่มงาน: คืน true ถ้า graph หยุดรออนุมัติ
export async function start(graph: PauseGraph, threadId: string, action: string): Promise<boolean> {
  const r = await graph.invoke({ action }, cfg(threadId));
  return isInterrupted(r);
}

// ตอบกลับคำถามที่ค้างอยู่ แล้วคืน result สุดท้าย
export async function answer(graph: PauseGraph, threadId: string, reply: string): Promise<string> {
  // 👉 ข้อ 2: invoke ด้วย new Command({ resume: reply }) และ config ของ thread แล้วคืน .result
  return todo(2);
}
