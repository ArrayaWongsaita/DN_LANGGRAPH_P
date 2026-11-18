import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

export function buildDiamond(withReducer: boolean) {
  const logField = withReducer
    ? new ReducedValue(z.array(z.string()).default(() => []), {
        inputSchema: z.string(),
        reducer: (a: string[], b: string) => [...a, b],
      })
    : z.array(z.string()).default(() => []);
  const State = new StateSchema({ log: logField });
  const write = (name: string) => () => ({ log: withReducer ? name : [name] }) as never;
  return new StateGraph(State)
    .addNode("a", write("a"))
    .addNode("b", write("b"))
    .addNode("c", write("c"))
    .addNode("d", write("d"))
    .addEdge(START, "a")
    .addEdge("a", "b")
    .addEdge("a", "c")
    .addEdge("b", "d")
    .addEdge("c", "d")
    .addEdge("d", END)
    .compile();
}

export interface DebugEvent {
  type: string;
  step: number;
  payload?: { name?: string };
}

export async function recordDebug(graph: ReturnType<typeof buildDiamond>): Promise<DebugEvent[]> {
  const events: DebugEvent[] = [];
  for await (const e of await graph.stream({}, { streamMode: "debug" })) events.push(e as unknown as DebugEvent);
  return events;
}

export function groupSupersteps(events: DebugEvent[]): { step: number; nodes: string[] }[] {
  const byStep = new Map<number, string[]>();
  for (const e of events) {
    if (e.type !== "task" || !e.payload?.name) continue;
    byStep.set(e.step, [...(byStep.get(e.step) ?? []), e.payload.name]);
  }
  return [...byStep.entries()].sort((x, y) => x[0] - y[0]).map(([step, nodes]) => ({ step, nodes: [...nodes].sort() }));
}

export function maxParallelism(steps: { nodes: string[] }[]): number {
  return steps.reduce((max, s) => Math.max(max, s.nodes.length), 0);
}

export function findNameClashes(nodeNames: string[], stateKeys: string[]): string[] {
  const keys = new Set(stateKeys);
  return [...new Set(nodeNames.filter((n) => keys.has(n)))];
}

export function isConcurrentUpdateError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { lc_error_code?: string; message?: string };
  return e.lc_error_code === "INVALID_CONCURRENT_GRAPH_UPDATE" || String(e.message ?? "").includes("can only receive one value per step");
}

export function userChannels(channelNames: string[]): string[] {
  return channelNames.filter((c) => !/^(__|branch:|join:|start:)/.test(c));
}
