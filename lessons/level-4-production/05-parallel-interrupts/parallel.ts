import { Command, END, INTERRUPT, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-05  (ไม่ใช้ LLM)
// สอง node ขนานกันถามคนพร้อมกัน: ได้ interrupt สองอันในรอบเดียว ต้องตอบทั้งคู่ด้วย resume แบบ map (id -> คำตอบ) ทีเดียว
const State = new StateSchema({
  name: z.string().default(""),
  city: z.string().default(""),
});

const form = new StateGraph(State)
  .addNode("askName", () => ({ name: interrupt("ชื่ออะไร?") as string }))
  .addNode("askCity", () => ({ city: interrupt("อยู่เมืองไหน?") as string }))
  .addEdge(START, "askName")
  .addEdge(START, "askCity")
  .addEdge("askName", END)
  .addEdge("askCity", END)
  .compile({ checkpointer: new MemorySaver() });

// ฟังก์ชันตอบ (จำลองคนตอบ) และที่จดว่าถูกถามอะไรบ้าง
const asked: string[] = [];
const answerer = (q: string) => {
  asked.push(q);
  return q.includes("ชื่อ") ? "มาลี" : "เชียงใหม่";
};

const cfg = { configurable: { thread_id: "t" } };
const first = await form.invoke({}, cfg);
const pendingCount = isInterrupted(first) ? first[INTERRUPT].length : 0;

const answers: Record<string, string> = {};
if (isInterrupted(first)) {
  for (const pending of first[INTERRUPT]) {
    // 👉 ข้อ 1: answers[pending.id!] = answerer(String(pending.value))
    todo(1);
  }
}

// 👉 ข้อ 2: ตอบทุกคำถามทีเดียว: await form.invoke(new Command({ resume: answers }), cfg) ได้ state สุดท้าย
const done: { name: string; city: string } = todo(2);
console.log({ pendingCount, answers, done });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ interrupt ค้างสองอันพร้อมกัน", pendingCount === 2);
check("ฟังก์ชันตอบถูกเรียกครั้งเดียวต่อคำถาม และเห็นคำถามจริง", JSON.stringify([...asked].sort()) === JSON.stringify(["ชื่ออะไร?", "อยู่เมืองไหน?"]), "วนทุก pending ใน first[INTERRUPT]");
check("ตอบทีเดียวด้วย map แล้วได้ครบทั้งสองช่อง", done.name === "มาลี" && done.city === "เชียงใหม่", "resume ด้วย Command({ resume: answers })");
