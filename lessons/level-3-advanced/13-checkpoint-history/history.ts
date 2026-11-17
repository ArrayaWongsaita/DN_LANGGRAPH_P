import { END, MemorySaver, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

export function buildTimeGraph() {
  return new StateGraph(State)
    .addNode("a", () => ({ log: "a" }))
    .addNode("b", () => ({ log: "b" }))
    .addNode("c", () => ({ log: "c" }))
    .addEdge(START, "a")
    .addEdge("a", "b")
    .addEdge("b", "c")
    .addEdge("c", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type TimeGraph = ReturnType<typeof buildTimeGraph>;
export const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });
import type { StateSnapshot } from "@langchain/langgraph";
import { todo } from "@src/todo";

// ดึง snapshot ทั้งหมดของ thread (ใหม่ → เก่า)
export async function allSnapshots(graph: TimeGraph, threadId: string): Promise<StateSnapshot[]> {
  const out: StateSnapshot[] = [];
  // 👉 ข้อ 1: for await (const s of graph.getStateHistory(cfg(threadId))) ให้ push s ลง out
  return todo(1);
}

// หา checkpoint ที่ node ถัดไปคือ nodeName (เช่น "b" = จุดหลังทำ a เสร็จ ก่อนทำ b)
export async function findBefore(graph: TimeGraph, threadId: string, nodeName: string): Promise<StateSnapshot | undefined> {
  const snapshots = await allSnapshots(graph, threadId);
  // 👉 ข้อ 2: คืน snapshot แรกที่ s.next.includes(nodeName)
  return todo(2);
}
