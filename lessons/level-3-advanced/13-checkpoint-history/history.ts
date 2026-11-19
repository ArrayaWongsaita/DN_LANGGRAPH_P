import { END, MemorySaver, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import type { StateSnapshot } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-13  (ไม่ใช้ LLM)
// checkpointer เก็บ "ภาพถ่าย State" ทุกก้าวของ thread: ย้อนดูประวัติได้ด้วย getStateHistory (ใหม่ -> เก่า)
const State = new StateSchema({
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

const graph = new StateGraph(State)
  .addNode("a", () => ({ log: "a" }))
  .addNode("b", () => ({ log: "b" }))
  .addNode("c", () => ({ log: "c" }))
  .addEdge(START, "a")
  .addEdge("a", "b")
  .addEdge("b", "c")
  .addEdge("c", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "t" } };
await graph.invoke({}, config);

const snapshots: StateSnapshot[] = [];
// 👉 ข้อ 1: ดึง snapshot ทั้งหมดของ thread: for await (const s of graph.getStateHistory(config)) ให้ push s ลง snapshots
todo(1);

// 👉 ข้อ 2: หา snapshot แรกที่ node ถัดไปคือ "b" (จุดหลัง a เสร็จ ก่อน b ทำงาน): snapshots.find((s) => s.next.includes("b"))
const beforeB: StateSnapshot | undefined = todo(2);
console.log("จำนวน snapshot:", snapshots.length);
console.log("ก่อนทำ b:", beforeB?.values.log, "next =", beforeB?.next);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("มี snapshot หลายก้าว (อย่างน้อย 4)", snapshots.length >= 4, "ใช้ for await กับ graph.getStateHistory(config)");
check("snapshot แรกคือล่าสุด (จบแล้ว ไม่มี node ถัดไป)", snapshots[0]?.next.length === 0 && snapshots[0].values.log.join("") === "abc");
check("หา checkpoint ก่อนทำ b ได้ และ State ตอนนั้นมีแค่ a", beforeB?.values.log.join("") === "a", "หา s.next.includes(\"b\")");
