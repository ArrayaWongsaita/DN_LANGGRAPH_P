import { END, GraphRecursionError, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({ n: z.number().default(0) });

export function buildCounter() {
  const builder = new StateGraph(State)
    .addNode("inc", (s) => ({ n: s.n + 1 }))
    .addEdge(START, "inc")
    .addEdge("inc", END);
  return builder.compile();
}

interface Invokable {
  invoke(input: never, config?: { recursionLimit?: number }): Promise<unknown>;
}

export async function runWithLimit(
  graph: Invokable,
  input: object,
  limit: number,
): Promise<{ status: "ok"; state: unknown } | { status: "limit" }> {
  try {
    const state = await graph.invoke(input as never, { recursionLimit: limit });
    return { status: "ok", state };
  } catch (e) {
    if (e instanceof GraphRecursionError) return { status: "limit" };
    throw e;
  }
}
