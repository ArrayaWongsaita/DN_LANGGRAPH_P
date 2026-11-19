import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../../02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 1-06
// LLM "จำอะไรไม่ได้เลย" ทุกครั้งที่เรียก เราต้องส่งบทสนทนาทั้งหมดไปให้ใหม่เสมอ

const system = "ตอบสั้น ๆ เป็นภาษาไทย";
const history = [new HumanMessage("ฉันชื่อมาลี ชอบแมว"), new AIMessage("ยินดีที่ได้รู้จักค่ะคุณมาลี")];
const question = "ฉันชื่ออะไร และชอบอะไร";

// ข้อ 1: สร้าง array ข้อความตามลำดับ: system, ประวัติทั้งหมด, แล้วปิดท้ายด้วยคำถามใหม่
const messages = [new SystemMessage(system), ...history, new HumanMessage(question)];

// ข้อ 2: ส่ง messages ให้ LLM แล้วรอผลลัพธ์
const reply = await llm.invoke(messages);

// เทียบกับตอน "ไม่มีประวัติ" (ให้มาแล้ว) LLM จะตอบไม่ได้เพราะไม่รู้จักเรา
const noHistory = await llm.invoke([new SystemMessage(system), new HumanMessage(question)]);

console.log("มีประวัติ:   ", reply.text);
console.log("ไม่มีประวัติ:", noHistory.text);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check(
  "ลำดับข้อความเป็น system, human, ai, human",
  messages.map((m) => m.type).join(",") === "system,human,ai,human",
  "ต้องเป็น system ตามด้วยประวัติ แล้วคำถามใหม่ท้ายสุด",
);
check("ได้คำตอบเป็นข้อความ", typeof reply.text === "string" && reply.text.length > 0, "ลืม await หรือเปล่า?");
