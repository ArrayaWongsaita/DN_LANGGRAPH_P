import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

// field ธรรมดา: ค่าใหม่ "ทับ" ค่าเก่า
// field ที่มี reducer: ค่าใหม่ถูก "รวม" กับค่าเก่าตามกติกาที่เรากำหนด
//   reducer: (ค่าปัจจุบัน, ค่าใหม่ที่เข้ามา) => ค่าที่จะเก็บ
export const CounterState = new StateSchema({
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(), // ชนิดของ "ค่าใหม่" ที่ node ส่งมา (ทีละข้อความ)
    reducer: (current: string[], next: string) => {
      // 👉 ข้อ 1: คืน array ใหม่ที่เอา next ต่อท้าย current (ห้ามแก้ current ตรง ๆ)
      // แนวทาง: return [...current, next];
      return todo(1);
    },
  }),
  score: new ReducedValue(z.number().default(0), {
    inputSchema: z.number(),
    reducer: (current: number, next: number) => {
      // 👉 ข้อ 2: คืนผลบวกของ current กับ next
      return todo(2);
    },
  }),
});

// ทำงานเรียงกัน a แล้ว b
export function buildSequentialGraph() {
  return new StateGraph(CounterState)
    .addNode("a", () => ({ log: "a" }))
    .addNode("b", () => ({ log: "b" }))
    .addEdge(START, "a")
    .addEdge("a", "b")
    .addEdge("b", END)
    .compile();
}

// x กับ y ทำงาน "ขนานกัน" ใน step เดียว และเขียน field เดียวกันพร้อมกัน
// ถ้า field ไม่มี reducer จะ error "LastValue can only receive one value per step"
export function buildParallelGraph() {
  return new StateGraph(CounterState)
    .addNode("x", () => ({ log: "x", score: 1 }))
    .addNode("y", () => ({ log: "y", score: 2 }))
    .addEdge(START, "x")
    .addEdge(START, "y")
    .addEdge("x", END)
    .addEdge("y", END)
    .compile();
}
