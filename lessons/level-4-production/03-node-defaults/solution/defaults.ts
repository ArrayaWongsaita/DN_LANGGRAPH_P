import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({ log: z.string().default("") });

export interface Attempts {
  a: number;
  b: number;
  strict: number;
}

const flaky = (name: keyof Attempts, attempts: Attempts, failTimes: number) => () => {
  attempts[name]++;
  if (attempts[name] <= failTimes) throw new Error(`${name} ล้ม`);
  return {};
};

export function buildApp(attempts: Attempts) {
  const defaults = { retryPolicy: { maxAttempts: 3, initialInterval: 1 } };
  const strictOptions = { retryPolicy: { maxAttempts: 1 } };
  return new StateGraph(State)
    .setNodeDefaults(defaults as never)
    .addNode("a", flaky("a", attempts, 2))
    .addNode("b", flaky("b", attempts, 2))
    .addNode("strict", flaky("strict", attempts, 1), strictOptions as never)
    .addEdge(START, "a")
    .addEdge(START, "b")
    .addEdge("a", "strict")
    .addEdge("b", "strict")
    .addEdge("strict", END)
    .compile();
}
