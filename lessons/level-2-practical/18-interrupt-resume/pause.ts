// รันด้วย pnpm lesson 2-18
import { Command, END, START, MemorySaver, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";
import { todo } from "@src/todo";

const State = new StateSchema({
  action: z.string(),
  decision: z.string().default(""),
});

const graph = new StateGraph(State)
  .addNode("ask", (state) => {
    const answer: unknown = interrupt({ question: "อนุมัติไหม?", action: state.action });
    return { decision: String(answer) };
  })
  .addEdge(START, "ask")
  .addEdge("ask", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "report" } };
const started = await graph.invoke({ action: "เผยแพร่รายงาน" }, config);
const pending = isInterrupted(started);
console.log(JSON.stringify({ pending, request: pending ? started.__interrupt__[0]?.value : undefined }));

const reply = "yes";
// 👉 ข้อ 1 ให้กราฟทำต่อด้วย Command({ resume: reply }) และ config เดิม
// แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
//   const finished = await graph.invoke(new Command({ resume: reply }), config);
const finished: { decision: string } = todo(1);
console.log(JSON.stringify({ pending: isInterrupted(finished), decision: finished.decision }));












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("กราฟหยุดและส่งคำถามพร้อมชื่องาน", pending &&
  JSON.stringify(started.__interrupt__[0]?.value) === JSON.stringify({ question: "อนุมัติไหม?", action: "เผยแพร่รายงาน" }));
check("กราฟทำต่อและบันทึกคำตอบ", !isInterrupted(finished) && finished.decision === reply, "ใช้ Command({ resume: reply }) พร้อม config เดิม");
