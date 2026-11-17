import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  action: z.string().default(""),
  decision: z.string().default(""),
  result: z.string().default(""),
});

export function buildPauseGraph() {
  return new StateGraph(State)
    .addNode("ask", (state) => {
      const answer = interrupt({ question: "อนุมัติไหม?", action: state.action });
      return { decision: String(answer) };
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

export async function start(graph: PauseGraph, threadId: string, action: string): Promise<boolean> {
  const r = await graph.invoke({ action }, cfg(threadId));
  return isInterrupted(r);
}

export async function answer(graph: PauseGraph, threadId: string, reply: string): Promise<string> {
  const r = await graph.invoke(new Command({ resume: reply }), cfg(threadId));
  return r.result;
}
