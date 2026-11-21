import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent, summarizationMiddleware } from "langchain";
import { todo } from "@src/todo";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-28
// แทนที่จะเขียน node สรุปเอง (บท 2-06) ใช้ summarizationMiddleware สำเร็จรูป: สรุปประวัติให้อัตโนมัติเมื่อยาวเกินเกณฑ์

// 👉 ข้อ 1 สร้าง middleware: summarizationMiddleware({ model: llm, trigger: { messages: 4 }, keep: { messages: 2 } })
//        (สรุปเมื่อมีตั้งแต่ 4 ข้อความ เก็บข้อความล่าสุดไว้ 2 ข้อความ)
// แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
//   const summarizer = summarizationMiddleware({ model: llm, trigger: { messages: 4 }, keep: { messages: 2 } });
const summarizer = todo(1);

const agent = createAgent({ model: llm, tools: [], checkpointer: new MemorySaver(), middleware: [summarizer] });

const config = { configurable: { thread_id: "t" } };
const sizes: number[] = [];
let last = "";
for (const text of ["ฉันชื่อมาลี", "ฉันชอบแมว", "ฉันอยู่เชียงใหม่", "ฉันทำงานเป็นครู", "ฉันชื่ออะไร"]) {
  const r = await agent.invoke({ messages: [new HumanMessage(text)] }, config);
  sizes.push(r.messages.length);
  last = r.messages[r.messages.length - 1].text;
}
console.log("จำนวนข้อความใน State หลังแต่ละรอบ:", sizes);
console.log("คำตอบสุดท้าย:", last);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ประวัติถูกสรุปและตัดให้สั้นลง (จำนวนข้อความไม่โตเป็น 10 ข้อความ)", sizes[sizes.length - 1] < 10, "ใช้ trigger: { messages: 4 }");
check("หลังสรุป agent ยังจำชื่อ 'มาลี' ได้", last.includes("มาลี"), "สรุปต้องเก็บใจความสำคัญไว้");
