import { END, START, StateGraph, StateSchema, isNodeTimeoutError } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({ log: z.string().default("") });

export function buildJob(workMs: number, timeoutMs: number) {
  // 👉 ข้อ 1: options ของ node: { timeout: timeoutMs }
  const options = todo(1);
  return new StateGraph(State)
    .addNode(
      "slow",
      async () => {
        await new Promise((resolve) => setTimeout(resolve, workMs));
        return { log: "เสร็จ" };
      },
      options,
    )
    .addEdge(START, "slow")
    .addEdge("slow", END)
    .compile();
}

export type RunResult = { ok: true; log: string } | { ok: false; node: string };

export async function runJob(job: ReturnType<typeof buildJob>): Promise<RunResult> {
  try {
    const result = await job.invoke({});
    return { ok: true, log: result.log };
  } catch (error) {
    // 👉 ข้อ 2: ถ้า isNodeTimeoutError(error) คืน { ok: false, node: error.node } ไม่เช่นนั้นโยน error ต่อ
    return todo(2);
  }
}
