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
  stream(input: never, options: { streamMode: "updates" | "values" }): Promise<AsyncIterable<unknown>>;
}

export async function collectUpdates(
  graph: Streamable,
  input: object,
): Promise<{ node: string; update: unknown }[]> {
  const result: { node: string; update: unknown }[] = [];
  for await (const chunk of await graph.stream(input as never, { streamMode: "updates" })) {
    for (const [node, update] of Object.entries(chunk as object)) result.push({ node, update });
  }
  return result;
}

export async function collectValues(graph: Streamable, input: object): Promise<unknown[]> {
  const result: unknown[] = [];
  for await (const chunk of await graph.stream(input as never, { streamMode: "values" })) {
    result.push(chunk);
  }
  return result;
}
