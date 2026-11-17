import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

export function buildStreamDemo() {
  return new StateGraph(State)
    .addNode("first", () => ({ log: "first" }))
    .addNode("second", () => ({ log: "second" }))
    .addEdge(START, "first")
    .addEdge("first", "second")
    .addEdge("second", END)
    .compile();
}

interface Streamable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream(input: any, options: any): Promise<AsyncIterable<any>>;
}

// streamMode "updates": แต่ละชิ้นคือ { ชื่อ node: สิ่งที่ node นั้นอัปเดต }
export async function collectUpdates(
  graph: Streamable,
  input: object,
): Promise<{ node: string; update: object }[]> {
  const result: { node: string; update: object }[] = [];
  for await (const chunk of await graph.stream(input, { streamMode: "updates" })) {
    for (const [node, update] of Object.entries(chunk)) {
      result.push({ node, update: update as object });
    }
  }
  return result;
}
