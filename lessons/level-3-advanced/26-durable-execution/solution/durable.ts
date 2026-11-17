import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

export interface Runs {
  one: number;
  two: number;
  three: number;
}

const State = new StateSchema({ log: z.string().default("") });

export function buildLongJob(runs: Runs, failTwoOnce: { value: boolean }) {
  return new StateGraph(State)
    .addNode("one", (s) => {
      runs.one++;
      return { log: `${s.log}1` };
    })
    .addNode("two", (s) => {
      runs.two++;
      if (failTwoOnce.value) {
        failTwoOnce.value = false;
        throw new Error("เครือข่ายล่ม");
      }
      return { log: `${s.log}2` };
    })
    .addNode("three", (s) => {
      runs.three++;
      return { log: `${s.log}3` };
    })
    .addEdge(START, "one")
    .addEdge("one", "two")
    .addEdge("two", "three")
    .addEdge("three", END)
    .compile({ checkpointer: new MemorySaver() });
}

type Job = ReturnType<typeof buildLongJob>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

export async function runJob(job: Job, threadId: string): Promise<boolean> {
  try {
    await job.invoke({}, { ...cfg(threadId), durability: "sync" });
    return true;
  } catch (e) {
    // ล่มจากเครือข่ายจริงเท่านั้นถึงนับว่า "ล่ม" ส่วน error อื่น (เช่นยังไม่ได้เติมช่อง) ให้โยนต่อ
    if ((e as Error).message !== "เครือข่ายล่ม") throw e;
    return false;
  }
}

export async function resumeJob(job: Job, threadId: string): Promise<string> {
  const r = await job.invoke(null, cfg(threadId));
  return r.log;
}
