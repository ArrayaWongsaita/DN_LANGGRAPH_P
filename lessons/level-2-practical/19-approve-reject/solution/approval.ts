import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";

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
    .addConditionalEdges("request", (state) => (state.approved ? "execute" : "cancelled"), ["execute", "cancelled"])
    .addEdge("execute", END)
    .addEdge("cancelled", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type ApprovalGraph = ReturnType<typeof buildApprovalGraph>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

export async function submit(graph: ApprovalGraph, threadId: string, action: string): Promise<void> {
  await graph.invoke({ action }, cfg(threadId));
}

export async function pendingQuestion(graph: ApprovalGraph, threadId: string): Promise<string | undefined> {
  const state = await graph.getState(cfg(threadId));
  return (state.tasks[0]?.interrupts[0]?.value as { question?: string } | undefined)?.question;
}

export async function decide(graph: ApprovalGraph, threadId: string, approved: boolean): Promise<string> {
  const r = await graph.invoke(new Command({ resume: approved }), cfg(threadId));
  return r.result;
}
