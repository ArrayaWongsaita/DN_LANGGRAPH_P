import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

export class PermanentError extends Error {}

export interface Counters {
  flaky: number;
  strict: number;
}

const State = new StateSchema({ out: z.string().default("") });

export function buildRetryGraph(counters: Counters, mode: "flaky" | "strict") {
  const flaky = () => {
    counters.flaky++;
    if (counters.flaky < 3) throw new Error("ล้มเหลวชั่วคราว");
    return { out: "สำเร็จ" };
  };
  const strict = () => {
    counters.strict++;
    throw new PermanentError("ผิดถาวร");
  };
  return new StateGraph(State)
    .addNode("work", mode === "flaky" ? flaky : strict, {
      retryPolicy: {
        maxAttempts: 3,
        initialInterval: 10,
        retryOn: (e: unknown) => !(e instanceof PermanentError),
      },
    })
    .addEdge(START, "work")
    .addEdge("work", END)
    .compile();
}
