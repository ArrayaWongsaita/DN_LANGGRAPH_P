import { AIMessage, type BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-25
// few-shot = ใส่ "ตัวอย่างคำถาม-คำตอบ" ในข้อความก่อนคำถามจริง เพื่อสอนรูปแบบคำตอบให้ LLM โดยไม่ต้องฝึกโมเดลใหม่
const SYSTEM = "จัดประเภทความรู้สึกของข้อความ ตอบคำเดียว: บวก หรือ ลบ";
const examples = [
  { input: "อาหารอร่อยมาก", output: "บวก" },
  { input: "รอนานมาก บริการแย่", output: "ลบ" },
];

const tests = [
  { input: "พนักงานน่ารัก ประทับใจสุด ๆ", expected: "บวก" },
  { input: "ของเสียตั้งแต่วันแรก ผิดหวังมาก", expected: "ลบ" },
];

const messagesSent: BaseMessage[][] = [];
const answers: string[] = [];
for (const { input } of tests) {
  // 👉 ข้อ 1: สร้างรายการข้อความ: SystemMessage(SYSTEM) แล้วตามด้วยตัวอย่างแต่ละตัวเป็น
  //        HumanMessage(example.input) + AIMessage(example.output) แล้วปิดท้ายด้วย HumanMessage(input)
  // แนวทาง: [new SystemMessage(SYSTEM), ...examples.flatMap((e) => [new HumanMessage(e.input), new AIMessage(e.output)]), new HumanMessage(input)]
  const messages: BaseMessage[] = todo(1);
  messagesSent.push(messages);

  // 👉 ข้อ 2: ส่ง messages ให้ llm.invoke แล้วเอา .text ที่ตัดช่องว่างหัวท้าย (trim) เก็บลง answers
  // แนวทาง: answers.push((await llm.invoke(messages)).text.trim());
  todo(2);
}
console.log(tests.map((t, i) => `${t.input} -> ${answers[i]}`));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ลำดับข้อความ: system, (human, ai) ต่อตัวอย่าง, แล้ว human ของคำถามจริง", messagesSent[0]?.map((m) => m.type).join(",") === "system,human,ai,human,ai,human", "ตัวอย่างแต่ละตัวต้องเป็นคู่ human แล้ว ai");
check("คำถามจริงอยู่ท้ายสุด", messagesSent[0]?.at(-1)?.text === tests[0].input);
check("LLM จัดประเภทตามตัวอย่างได้ถูก (บวก/ลบ)", answers.every((a, i) => a === tests[i].expected), "ถ้าไม่ผ่านดูว่าส่งตัวอย่างครบก่อนคำถามจริง");
