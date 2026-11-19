import { HumanMessage } from "@langchain/core/messages";
import type { AIMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";
import { makeAddTool, makeWeatherTool } from "@src/sampleTools";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-09
// LLM เรียก tool เองไม่ได้ มันแค่ "ขอ" ให้เรียก (ได้ tool_calls กลับมา) เราเป็นคนรัน tool แล้วส่งผลกลับ
// (add และ getWeather คือ tool จากบท 2-08 ที่เตรียมไว้ใน src/sampleTools)
const tools = [makeAddTool(), makeWeatherTool()];

// 👉 ข้อ 1: ผูก tools ให้ llm เพื่อให้มันรู้ว่ามี tool อะไรให้ขอใช้
// แนวทาง: llm.bindTools!(tools)
const bound = todo(1);

// 👉 ข้อ 2: ถามด้วย bound.invoke (ส่งเป็นอาร์เรย์ [new HumanMessage(question)]) ได้ AIMessage ที่ขอเรียก tool
//        ถ้าถามเรื่องบวกเลข LLM จะไม่ตอบเอง แต่ขอเรียก add
const question = "ช่วยใช้ tool add บวก 23 กับ 19 ให้หน่อย";
const reply: AIMessage = todo(2);
console.log("tool_calls ที่ LLM ขอ:", reply.tool_calls);

const call = reply.tool_calls?.[0];
// 👉 ข้อ 3: รัน tool ตามที่ LLM ขอ: หา tool จากชื่อ call.name ใน tools แล้วเรียก .invoke(call.args)
//        ถ้าไม่เจอ tool ชื่อนั้น ให้ throw new Error(`ไม่มี tool ชื่อ ${call.name}`)
const toolResult: string = todo(3);
console.log("ผลของ tool:", toolResult);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("LLM ขอเรียก tool ชื่อ add", call?.name === "add", "ต้อง bindTools ก่อน invoke");
check("ผลของ tool คือ '42'", toolResult === "42", "รัน tool ด้วย call.args ที่ LLM ส่งมา");
