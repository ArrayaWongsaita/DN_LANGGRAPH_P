import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const State = new StateSchema({
  action: z.string().default(""),
  approved: z.boolean().default(false),
  result: z.string().default(""),
});

export function buildApprovalGraph() {
  return new StateGraph(State)
    .addNode("request", (state) => {
      const ok = interrupt({ question: `อนุมัติ "${state.action}" ไหม`, action: state.action });
      return { approved: ok === true };
    })
    .addNode("execute", (state) => ({ result: `ทำแล้ว: ${state.action}` }))
    .addNode("cancelled", (state) => ({ result: `ยกเลิก: ${state.action}` }))
    .addEdge(START, "request")
    .addConditionalEdges(
      "request",
      (state) => {
        // 👉 ข้อ 1: คืน "execute" ถ้า state.approved เป็นจริง ไม่เช่นนั้นคืน "cancelled"
        return todo(1);
      },
      ["execute", "cancelled"],
    )
    .addEdge("execute", END)
    .addEdge("cancelled", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type ApprovalGraph = ReturnType<typeof buildApprovalGraph>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

export async function submit(graph: ApprovalGraph, threadId: string, action: string): Promise<void> {
  await graph.invoke({ action }, cfg(threadId));
}

// คำถามที่ graph รออยู่ (undefined ถ้าไม่ได้รออะไร)
export async function pendingQuestion(graph: ApprovalGraph, threadId: string): Promise<string | undefined> {
  const state = await graph.getState(cfg(threadId));
  // 👉 ข้อ 2: คืน state.tasks[0]?.interrupts[0]?.value?.question (ถ้าไม่มีให้ undefined)
  return todo(2);
}

export async function decide(graph: ApprovalGraph, threadId: string, approved: boolean): Promise<string> {
  // 👉 ข้อ 3: resume ด้วย new Command({ resume: approved }) แล้วคืน .result
  return todo(3);
}
