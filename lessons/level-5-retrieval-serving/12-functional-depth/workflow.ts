import { type BaseCheckpointSaver, Command, MemorySaver, entrypoint, getPreviousState, getWriter, interrupt, task } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-12  (ไม่ใช้ LLM ไม่ใช้ฐานข้อมูล: Functional API จริงกับ MemorySaver)
// Functional API เจาะลึก: entrypoint คือเวิร์กโฟลว์ที่เขียนเป็นฟังก์ชันธรรมดา, task คือหน่วยงานที่มีผลข้างเคียง (ผลถูกเก็บ ไม่รันซ้ำตอน resume), getPreviousState จำค่าข้ามรอบใน thread เดิม, getWriter ส่งข้อมูลทาง custom stream, retry ลองใหม่เมื่อ task ล้ม

// ตัวนับว่า task ถูกเรียกจริงกี่ครั้ง (ไว้ตรวจ)
const calls = { reserve: 0, ship: 0, flaky: 0, double: 0 };
const resetCalls = () => Object.assign(calls, { reserve: 0, ship: 0, flaky: 0, double: 0 });

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
function buildTotals(checkpointer: BaseCheckpointSaver) {
  // 👉 ข้อ 1 คืน entrypoint({ name: "totals", checkpointer }, async (inc: number) => { ... })
  //          total = (getPreviousState<number>() ?? 0) + inc แล้ว return entrypoint.final({ value: total, save: total })
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   return entrypoint({ name: "totals", checkpointer }, async (inc: number) => {
  //     const total = (getPreviousState<number>() ?? 0) + inc;
  //     return entrypoint.final({ value: total, save: total });
  //   });
  return todo(1);
}

// จอง → รออนุมัติ → ส่งของ
function buildOrderFlow(checkpointer: BaseCheckpointSaver) {
  return entrypoint({ name: "order", checkpointer }, async (input: { item: string }) => {
    const reserved = await reserve(input.item);
    const approved = interrupt({ question: `อนุมัติส่ง ${reserved} ไหม`, reserved });
    if (!approved) return "ยกเลิก";
    return await ship(reserved);
  });
}

// ส่งความคืบหน้าทาง custom stream
function buildProgress() {
  return entrypoint({ name: "progress" }, async (n: number) => {
    const write = getWriter() ?? (() => {});
    write({ progress: "เริ่ม" });
    const r = await double(n);
    write({ progress: "เสร็จ" });
    return r;
  });
}

// task ที่ล้ม 2 ครั้งแรกแล้วสำเร็จ
function makeFlakyTask() {
  return task({ name: "flaky", retry: { maxAttempts: 3, initialInterval: 1 } }, async () => {
    calls.flaky++;
    if (calls.flaky < 3) throw new Error("ล้มชั่วคราว");
    return "สำเร็จ";
  });
}

// (ให้ไว้แล้ว)
function buildRetryFlow() {
  const flaky = makeFlakyTask();
  return entrypoint({ name: "retry-flow" }, async (_n: number) => await flaky());
}

const cfg = (id: string) => ({ configurable: { thread_id: id } });
type Pending = { __interrupt__?: { value: { question: string; reserved: string } }[] };

// ยอดสะสม
const totals = buildTotals(new MemorySaver());
const t1 = await totals.invoke(5, cfg("a"));
const t2 = await totals.invoke(2, cfg("a"));
const t3 = await totals.invoke(1, cfg("a"));
const t4 = await totals.invoke(1, cfg("b"));
const t5 = await totals.invoke(1, cfg("a"));

// สั่งของ: หยุดรออนุมัติ → อนุมัติ → (อีก thread) ไม่อนุมัติ
resetCalls();
const order = buildOrderFlow(new MemorySaver());
const paused = (await order.invoke({ item: "หูฟัง" }, cfg("o1"))) as Pending;
const callsPaused = { ...calls };
const shipped = await order.invoke(new Command({ resume: true }), cfg("o1"));
const callsShipped = { ...calls };
resetCalls();
await order.invoke({ item: "หูฟัง" }, cfg("o3"));
const cancelled = await order.invoke(new Command({ resume: false }), cfg("o3"));
const callsCancelled = { ...calls };

// สตรีมความคืบหน้า
const progress = buildProgress();
const custom: unknown[] = [];
const updates: unknown[] = [];
for await (const [mode, chunk] of await progress.stream(21, { streamMode: ["custom", "updates"] })) (mode === "custom" ? custom : updates).push(chunk);
const plainRun = await progress.invoke(5);

// ลองใหม่
resetCalls();
const retried = await buildRetryFlow().invoke(0);
const flakyCalls = calls.flaky;
console.log({ t1, t2, t3, shipped, cancelled, custom, retried });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const json = (v: unknown) => JSON.stringify(v);
check("totals: สะสมข้ามรอบใน thread เดิม และคืนเฉพาะ value (ไม่ใช่ { value, save })", t1 === 5 && t2 === 7 && t3 === 8, "entrypoint.final({ value, save })");
check("totals: thread ต่างกันไม่ปนกัน", t4 === 1 && t5 === 9);
check("order: หยุดรออนุมัติหลังจอง (ยังไม่ส่งของ)", paused.__interrupt__?.[0].value.reserved === "จอง:หูฟัง" && (paused.__interrupt__?.[0].value.question ?? "").includes("จอง:หูฟัง") && callsPaused.reserve === 1 && callsPaused.ship === 0);
check("order: อนุมัติแล้วส่งของ และ task จองไม่รันซ้ำตอน resume", shipped === "ส่งของ(จอง:หูฟัง)" && callsShipped.reserve === 1 && callsShipped.ship === 1, "ผลของ task ถูกเก็บ resume แล้วไม่รันซ้ำ");
check("order: ไม่อนุมัติ → ยกเลิก ไม่ส่งของ", cancelled === "ยกเลิก" && callsCancelled.reserve === 1 && callsCancelled.ship === 0);
check("progress: custom stream ได้เริ่ม/เสร็จตามลำดับ และผลลัพธ์ถูก", json(custom) === json([{ progress: "เริ่ม" }, { progress: "เสร็จ" }]) && json(updates).includes("42") && plainRun === 10, "getWriter() อาจเป็น undefined เมื่อไม่ได้สตรีม");
check("retry: task ล้ม 2 ครั้งแล้วสำเร็จภายใน 3 ครั้ง", retried === "สำเร็จ" && flakyCalls === 3);
