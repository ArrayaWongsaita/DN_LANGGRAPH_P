import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
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

// รันงาน (ใช้ durability แบบ sync) คืน true ถ้าสำเร็จ false ถ้าล่ม
export async function runJob(job: Job, threadId: string): Promise<boolean> {
  try {
    // 👉 ข้อ 1: await job.invoke({}, { ...cfg(threadId), durability: "sync" })
    todo(1);
    return true;
  } catch (e) {
    // ล่มจากเครือข่ายจริงเท่านั้นถึงนับว่า "ล่ม" ส่วน error อื่น (เช่นยังไม่ได้เติมช่อง) ให้โยนต่อ
    if ((e as Error).message !== "เครือข่ายล่ม") throw e;
    return false;
  }
}

// ทำต่อหลังล่ม คืน log สุดท้าย
export async function resumeJob(job: Job, threadId: string): Promise<string> {
  // 👉 ข้อ 2: invoke ด้วย input เป็น null และ cfg(threadId) เดิม แล้วคืน .log
  return todo(2);
}
