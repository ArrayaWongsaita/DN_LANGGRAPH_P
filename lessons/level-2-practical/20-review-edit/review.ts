import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { todo } from "@src/todo";

const State = new StateSchema({
  topic: z.string().default(""),
  draft: z.string().default(""),
  final: z.string().default(""),
});

export function buildReviewGraph(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("write", async (state) => ({
      draft: (await llm.invoke(`ร่างอีเมลสั้น ๆ เรื่อง ${state.topic}`)).text,
    }))
    .addNode("review", (state) => {
      // 👉 ข้อ 1: เรียก interrupt({ draft: state.draft }) ได้ค่า edited กลับมา
      //          ถ้า edited เป็นสตริงที่ไม่ว่าง ใช้เป็น final ไม่เช่นนั้นใช้ state.draft เป็น final
      return todo(1);
    })
    .addEdge(START, "write")
    .addEdge("write", "review")
    .addEdge("review", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type ReviewGraph = ReturnType<typeof buildReviewGraph>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

// เริ่มงาน คืนร่างที่รอตรวจ
export async function startReview(graph: ReviewGraph, threadId: string, topic: string): Promise<string> {
  const r = await graph.invoke({ topic }, cfg(threadId));
  const pending = (r as { __interrupt__?: { value: { draft: string } }[] }).__interrupt__;
  return pending![0].value.draft;
}

// ส่งฉบับแก้ (หรือสตริงว่าง = ใช้ตามร่าง) คืนฉบับสุดท้าย
export async function submitReview(graph: ReviewGraph, threadId: string, edited: string): Promise<string> {
  // 👉 ข้อ 2: resume ด้วย new Command({ resume: edited }) แล้วคืน .final
  return todo(2);
}

// ผู้ใช้กด "ใช้ตามร่าง"
export async function acceptDraft(graph: ReviewGraph, threadId: string): Promise<string> {
  // 👉 ข้อ 3: เรียก submitReview ด้วย edited เป็นสตริงว่าง
  return todo(3);
}
