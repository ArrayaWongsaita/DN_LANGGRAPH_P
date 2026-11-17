import { fakeLLM } from "../../../src/fakeLLM";
import { translatePrompt } from "./translatePrompt";

// ================================================
// บทที่ 10: prompt template
// ฝึก: ChatPromptTemplate, formatMessages, pipe
// ตัวอย่าง:
//   const msgs = await translatePrompt.formatMessages({ language: "อังกฤษ", text: "สวัสดี" });
// ================================================

// ------------------------------------------------
// ข้อ 1: formatMessages ต้องเติม language และ text ลงในข้อความ
// แนวทาง: รวม content ทุกข้อความเป็นสตริงเดียว แล้ว toContain
// ------------------------------------------------
test.todo("เติมตัวแปรลงในข้อความ");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: ถ้าขาดตัวแปร (เช่นไม่ใส่ text) ต้อง reject
// แนวทาง: await expect(...formatMessages({ language: "อังกฤษ" })).rejects.toThrow()
// ------------------------------------------------
test.todo("ขาดตัวแปรต้อง reject");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: translatePrompt.pipe(fakeLLM(["Hello"])) แล้ว invoke ต้องได้ content "Hello"
// แนวทาง: chain.invoke({ language, text }) แล้วดู .content
// ------------------------------------------------
test.todo("pipe เข้า LLM แล้วได้คำตอบ");
// 👉 เขียน test ของข้อ 3 ตรงนี้
