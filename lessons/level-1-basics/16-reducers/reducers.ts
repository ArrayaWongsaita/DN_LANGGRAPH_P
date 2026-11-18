import { todo } from "@src/todo";
import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 16  (ไม่ใช้ LLM)
// field ธรรมดา: ค่าใหม่ "ทับ" ค่าเก่า
// field ที่มี reducer: ค่าใหม่ถูก "รวม" กับค่าเก่าตามกติกาที่เรากำหนด
//   reducer: (ค่าปัจจุบัน, ค่าใหม่ที่เข้ามา) => ค่าที่จะเก็บ
const CounterState = new StateSchema({
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
const sequential = new StateGraph(CounterState)
  .addNode("a", () => ({ log: "a" }))
  .addNode("b", () => ({ log: "b" }))
  .addEdge(START, "a")
  .addEdge("a", "b")
  .addEdge("b", END)
  .compile();

// x กับ y ทำงาน "ขนานกัน" ใน step เดียว และเขียน field เดียวกันพร้อมกัน
// ถ้า field ไม่มี reducer จะ error "LastValue can only receive one value per step"
const parallel = new StateGraph(CounterState)
  .addNode("x", () => ({ log: "x", score: 1 }))
  .addNode("y", () => ({ log: "y", score: 2 }))
  .addEdge(START, "x")
  .addEdge(START, "y")
  .addEdge("x", END)
  .addEdge("y", END)
  .compile();

const seq = await sequential.invoke({});
const par = await parallel.invoke({});
const withStart = await parallel.invoke({ score: 10 });
console.log("เรียงกัน:", seq);
console.log("ขนานกัน: ", par);

check("log: ค่าใหม่ถูก 'ต่อท้าย' ไม่ใช่ทับ (ทำงานเรียงกัน)", JSON.stringify(seq.log) === '["a","b"]', "reducer ของ log: [...current, next]");
check("สอง node ขนานกันเขียน log พร้อมกัน ค่าถูกรวมครบ", JSON.stringify([...par.log].sort()) === '["x","y"]');
check("score: ค่าใหม่ถูก 'บวกเพิ่ม' (1 + 2 = 3)", par.score === 3, "reducer ของ score: current + next");
check("ค่าเริ่มต้นที่ส่งเข้ามาก็ผ่าน reducer (10 + 1 + 2 = 13)", withStart.score === 13);
