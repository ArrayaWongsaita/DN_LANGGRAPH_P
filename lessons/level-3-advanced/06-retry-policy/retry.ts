import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
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
    .addNode(
      "work",
      mode === "flaky" ? flaky : strict,
      // 👉 ข้อ 1+2: ใส่ options { retryPolicy: { maxAttempts: 3, initialInterval: 10, retryOn: ... } }
      //   retryOn: (e) => !(e instanceof PermanentError)   (ไม่ลองซ้ำ error ถาวร)
      todo(1),
    )
    .addEdge(START, "work")
    .addEdge("work", END)
    .compile();
}
