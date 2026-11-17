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

async function snapshotBefore(graph: TimeGraph, threadId: string, nodeName: string): Promise<StateSnapshot> {
  for await (const s of graph.getStateHistory(cfg(threadId))) {
    if (s.next.includes(nodeName)) return s;
  }
  throw new Error(`ไม่พบ checkpoint ก่อน ${nodeName}`);
}

export async function replayFrom(graph: TimeGraph, threadId: string, nodeName: string): Promise<string[]> {
  const snap = await snapshotBefore(graph, threadId, nodeName);
  const r = await graph.invoke(null, snap.config);
  return r.log;
}

export async function forkFrom(
  graph: TimeGraph,
  threadId: string,
  nodeName: string,
  extra: string,
): Promise<string[]> {
  const snap = await snapshotBefore(graph, threadId, nodeName);
  const forked = await graph.updateState(snap.config, { log: extra });
  const r = await graph.invoke(null, forked);
  return r.log;
}
