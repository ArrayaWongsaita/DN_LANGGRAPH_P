import { AIMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { fakeLLM } from "../../../src/fakeLLM";
import { replyText } from "./replyText";

// ================================================
// บทที่ 07: invoke และผลตอบกลับ
// ฝึก: await llm.invoke, AIMessage, content
// ตัวอย่าง:
//   expect(await replyText(fakeLLM(["สวัสดี"]), "ทัก")).toBe("สวัสดี");
// รันกับ LLM จริง: npm run lesson 07
// ================================================

// ------------------------------------------------
// ข้อ 1: replyText คืนข้อความที่ LLM ตอบ
// แนวทาง: fakeLLM(["สวัสดี"]) แล้ว await replyText(llm, "ทัก")
// ------------------------------------------------
test.todo("คืนข้อความที่ LLM ตอบ");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: เรียกสองครั้งได้สองคำตอบตามลำดับ
// แนวทาง: ใช้ fakeLLM(["หนึ่ง", "สอง"]) ตัวเดียวเรียกสองครั้ง
// ------------------------------------------------
test.todo("เรียกสองครั้งได้สองคำตอบตามลำดับ");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: ถ้า content เป็น array ของ block [{ type: "text", text: "hi" }] ต้องได้ "hi"
// แนวทาง: สร้างโมเดลปลอม { invoke: async () => new AIMessage({ content: [...] }) } as unknown as BaseChatModel
// ------------------------------------------------
test.todo("content เป็น array ของ block");
// 👉 เขียน test ของข้อ 3 ตรงนี้
