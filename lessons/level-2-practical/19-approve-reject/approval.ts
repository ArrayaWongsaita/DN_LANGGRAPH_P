import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-19  (ไม่ใช้ LLM)
// อนุมัติ/ปฏิเสธ: คำตอบ true/false ที่ resume กลับมา เลือกว่า graph จะ "ทำ" หรือ "ยกเลิก" (ใช้ conditional edge)
const State = new StateSchema({
  action: z.string().default(""),
  approved: z.boolean().default(false),
  result: z.string().default(""),
});

const graph = new StateGraph(State)
  .addNode("request", (state) => {
    const ok = interrupt({ question: `อนุมัติ "${state.action}" ไหม`, action: state.action });
    return { approved: ok === true };
  })
  .addNode("execute", (state) => ({ result: `ทำแล้ว: ${state.action}` }))
  .addNode("cancelled", (state) => ({ result: `ยกเลิก: ${state.action}` }))
  .addEdge(START, "request")
  .addConditionalEdges(
    "request",
    (state) => {
      // 👉 ข้อ 1: คืน "execute" ถ้า state.approved เป็นจริง ไม่เช่นนั้นคืน "cancelled"
      return todo(1);
    },
    ["execute", "cancelled"],
  )
  .addEdge("execute", END)
  .addEdge("cancelled", END)
  .compile({ checkpointer: new MemorySaver() });

const questions: (string | undefined)[] = [];
const results: string[] = [];
for (const [threadId, approved] of [["a", true], ["b", false]] as const) {
  const config = { configurable: { thread_id: threadId } };
  await graph.invoke({ action: "ลบไฟล์ทั้งหมด" }, config);

  // ดูว่า graph กำลังรอคำถามอะไรอยู่ (อ่านจาก state ของ thread)
  const state = await graph.getState(config);
  // 👉 ข้อ 2: เอาคำถามที่ค้างอยู่จาก state.tasks[0]?.interrupts[0]?.value (เป็น object ที่มี field question)
  //        ถ้าไม่มีให้ได้ undefined
  // แนวทาง: (state.tasks[0]?.interrupts[0]?.value as { question?: string } | undefined)?.question
  const question: string | undefined = todo(2);
  questions.push(question);

  // 👉 ข้อ 3: resume ด้วย new Command({ resume: approved }) และ config ของ thread นี้ ได้ state สุดท้าย
  const finished: { result: string } = todo(3);
  results.push(finished.result);
}
console.log({ questions, results });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("อ่านคำถามที่ค้างอยู่ได้", questions[0] === 'อนุมัติ "ลบไฟล์ทั้งหมด" ไหม', "อ่านจาก state.tasks[0].interrupts[0].value.question");
check("อนุมัติ (true) -> ทำแล้ว", results[0] === "ทำแล้ว: ลบไฟล์ทั้งหมด", "resume ด้วย approved");
check("ปฏิเสธ (false) -> ยกเลิก", results[1] === "ยกเลิก: ลบไฟล์ทั้งหมด", "router ต้องเลือก cancelled เมื่อ approved เป็นเท็จ");
