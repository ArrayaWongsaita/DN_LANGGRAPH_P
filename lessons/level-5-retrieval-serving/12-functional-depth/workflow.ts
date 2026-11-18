import {
  type BaseCheckpointSaver,
  entrypoint,
  getPreviousState,
  getWriter,
  interrupt,
  task,
} from "@langchain/langgraph";
import { todo } from "@src/todo";

// ตัวนับว่า task ถูกเรียกจริงกี่ครั้ง (ไว้ตรวจใน test)
export const calls = { reserve: 0, ship: 0, flaky: 0, double: 0 };
export const resetCalls = () => Object.assign(calls, { reserve: 0, ship: 0, flaky: 0, double: 0 });

// (ให้ไว้แล้ว) งานที่มีผลข้างเคียง จึงอยู่ใน task
const reserve = task("reserve", async (item: string) => {
  calls.reserve++;
  return `จอง:${item}`;
});
const ship = task("ship", async (reserved: string) => {
  calls.ship++;
  return `ส่งของ(${reserved})`;
});
const double = task("double", async (n: number) => {
  calls.double++;
  return n * 2;
});

// ยอดสะสมต่อ thread
export function buildTotals(checkpointer: BaseCheckpointSaver) {
  // 👉 ข้อ 1: คืน entrypoint({ name: "totals", checkpointer }, async (inc: number) => { ... })
  //          total = (getPreviousState<number>() ?? 0) + inc แล้ว return entrypoint.final({ value: total, save: total })
  return todo(1);
}

// จอง → รออนุมัติ → ส่งของ
export function buildOrderFlow(checkpointer: BaseCheckpointSaver) {
  // 👉 ข้อ 2: entrypoint({ name: "order", checkpointer }, async (input: { item: string }) => { ... })
  //          reserved = await reserve(input.item)
  //          approved = interrupt({ question: `อนุมัติส่ง ${reserved} ไหม`, reserved })
  //          ถ้า approved เป็นเท็จ return "ยกเลิก" ไม่งั้น return await ship(reserved)
  return todo(2);
}

// ส่งความคืบหน้าทาง custom stream
export function buildProgress() {
  // 👉 ข้อ 3: entrypoint({ name: "progress" }, async (n: number) => { ... })
  //          write = getWriter() ?? (() => {}) (ไม่ได้สตรีมก็ไม่ต้องเขียน); write({ progress: "เริ่ม" }); r = await double(n); write({ progress: "เสร็จ" }); return r
  return todo(3);
}

// task ที่ล้ม 2 ครั้งแรกแล้วสำเร็จ
export function makeFlakyTask() {
  // 👉 ข้อ 4: คืน task({ name: "flaky", retry: { maxAttempts: 3, initialInterval: 1 } }, async () => { ... })
  //          ข้างใน calls.flaky++ แล้วถ้า calls.flaky < 3 ให้ throw new Error("ล้มชั่วคราว") ไม่งั้นคืน "สำเร็จ"
  return todo(4);
}

// (ให้ไว้แล้ว)
export function buildRetryFlow() {
  const flaky = makeFlakyTask();
  return entrypoint({ name: "retry-flow" }, async (_n: number) => await flaky());
}
