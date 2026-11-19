import { HumanMessage } from "@langchain/core/messages";
import { createAgent, modelCallLimitMiddleware, toolCallLimitMiddleware } from "langchain";
import { todo } from "@src/todo";
import { makeAddTool } from "@src/sampleTools";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-27
// middleware = โค้ดที่ครอบการทำงานของ agent: ที่นี่ใช้ "จำกัดจำนวนครั้ง" ที่เรียกโมเดล/tool ต่อหนึ่งการรัน กันงานวนกินเงิน
const tools = [makeAddTool()];
const question = "ใช้ tool add บวก 1 กับ 2 ก่อน แล้วเอาผลที่ได้ไปใช้ tool add บวก 10 อีกครั้ง บอกผลสุดท้าย";

// 👉 ข้อ 1: จำกัดจำนวนครั้งที่เรียกโมเดล: createAgent({ model: llm, tools, middleware: [modelCallLimitMiddleware({ runLimit: 1, exitBehavior: "end" })] })
const modelLimited: { invoke: (input: { messages: HumanMessage[] }) => Promise<{ messages: { type: string; text: string }[] }> } = todo(1);

// 👉 ข้อ 2: จำกัดจำนวนครั้งที่เรียก tool: createAgent({ model: llm, tools, middleware: [toolCallLimitMiddleware({ runLimit: 1 })] })
const toolLimited: { invoke: (input: { messages: HumanMessage[] }) => Promise<{ messages: { type: string; text: string }[] }> } = todo(2);

const a = await modelLimited.invoke({ messages: [new HumanMessage(question)] });
const b = await toolLimited.invoke({ messages: [new HumanMessage(question)] });
const count = (r: { messages: { type: string }[] }, type: string) => r.messages.filter((m) => m.type === type).length;
for (const r of [a, b]) console.log(r.messages.map((m) => `${m.type}: ${m.text.slice(0, 70)}`));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("จำกัดโมเดล 1 ครั้ง: tool ถูกรันครั้งเดียว แล้ว agent จบอย่างนุ่มนวลด้วยข้อความแจ้งว่าเกินโควตา", count(a, "tool") === 1 && a.messages[a.messages.length - 1].text.includes("limit"), "ใช้ modelCallLimitMiddleware({ runLimit: 1, exitBehavior: \"end\" })");
check("จำกัด tool 1 ครั้ง: tool รันจริงครั้งเดียว ครั้งที่สองถูกปฏิเสธ", b.messages.filter((m) => m.type === "tool" && m.text === "3").length === 1 && b.messages.some((m) => m.type === "tool" && m.text.includes("limit exceeded")), "ใช้ toolCallLimitMiddleware({ runLimit: 1 })");
