import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({ log: z.string().default("") });

export interface Attempts {
  a: number;
  b: number;
  strict: number;
}

// node ที่ล้มเหลว failTimes ครั้งแรกแล้วสำเร็จ
const flaky = (name: keyof Attempts, attempts: Attempts, failTimes: number) => () => {
  attempts[name]++;
  if (attempts[name] <= failTimes) throw new Error(`${name} ล้ม`);
  return {};
};

export function buildApp(attempts: Attempts) {
  // 👉 ข้อ 1: ค่าเริ่มต้นของทุก node: { retryPolicy: { maxAttempts: 3, initialInterval: 1 } }
  const defaults = todo(1);
  // 👉 ข้อ 2: ค่าเฉพาะของ strict ที่ทับค่าเริ่มต้น: { retryPolicy: { maxAttempts: 1 } }
  const strictOptions = todo(2);
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
