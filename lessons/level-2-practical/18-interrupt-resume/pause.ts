import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-18  (ไม่ใช้ LLM)
// interrupt() = หยุด graph กลางทางเพื่อรอคำตอบจากมนุษย์ (ต้องมี checkpointer) แล้วค่อยเดินต่อด้วย Command({ resume })
const State = new StateSchema({
  action: z.string().default(""),
  decision: z.string().default(""),
  result: z.string().default(""),
});

const graph = new StateGraph(State)
  .addNode("ask", (state) => {
    // 👉 ข้อ 1: เรียก interrupt({ question: "อนุมัติไหม?", action: state.action }) แล้วเก็บค่าที่ได้เป็น decision
    // แนวทาง: const answer = interrupt({...}); return { decision: String(answer) };
    return todo(1);
  })
  .addNode("act", (state) => ({
    result: state.decision === "yes" ? `ทำแล้ว: ${state.action}` : `ยกเลิก: ${state.action}`,
  }))
  .addEdge(START, "ask")
  .addEdge("ask", "act")
  .addEdge("act", END)
  .compile({ checkpointer: new MemorySaver() });

const paused: boolean[] = [];
const results: string[] = [];
for (const [threadId, reply] of [["a", "yes"], ["b", "no"]]) {
  const config = { configurable: { thread_id: threadId } };
  // เริ่มงาน: graph จะหยุดที่ interrupt
  const started = await graph.invoke({ action: "ลบไฟล์ทั้งหมด" }, config);
  paused.push(isInterrupted(started));
  // 👉 ข้อ 2: ตอบกลับคำถามที่ค้างอยู่ด้วย new Command({ resume: reply }) และ config ของ thread นี้ ได้ state สุดท้าย
  // แนวทาง: await graph.invoke(new Command({ resume: reply }), config)
  const finished: { result: string } = todo(2);
  results.push(finished.result);
}
console.log({ paused, results });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("เริ่มงานแล้ว graph หยุดรออนุมัติ (ทั้งสอง thread)", paused.every(Boolean), "ต้องเรียก interrupt() ใน node ask");
check("ตอบ yes -> ทำแล้ว", results[0] === "ทำแล้ว: ลบไฟล์ทั้งหมด", "ค่าที่ resume กลับมาคือค่าที่ interrupt() คืน");
check("ตอบ no -> ยกเลิก", results[1] === "ยกเลิก: ลบไฟล์ทั้งหมด");
