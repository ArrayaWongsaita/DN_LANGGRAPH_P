import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { fakeLLM } from "../../../src/fakeLLM";
import { askWithPersona } from "./persona";

// ================================================
// บทที่ 08: system prompt
// ฝึก: SystemMessage, HumanMessage, vi.spyOn
// vi.spyOn(llm, "invoke") แอบดูว่า invoke ถูกเรียกด้วยอะไร อ่านได้จาก spy.mock.calls[0][0]
// ตัวอย่าง:
//   const spy = vi.spyOn(llm, "invoke");
//   await askWithPersona(llm, "p", "q");
//   const messages = spy.mock.calls[0][0] as unknown[];
// รันกับ LLM จริง: npm run lesson 08
// ================================================

// ------------------------------------------------
// ข้อ 1: ข้อความแรกที่ส่งต้องเป็น SystemMessage ที่เนื้อหาคือ persona
// แนวทาง: expect(messages[0]).toBeInstanceOf(SystemMessage)
// ------------------------------------------------
test.todo("ข้อความแรกคือ SystemMessage ที่มี persona");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: ข้อความสุดท้ายต้องเป็น HumanMessage ที่เนื้อหาคือคำถาม
// แนวทาง: ดูตัวสุดท้ายของ messages
// ------------------------------------------------
test.todo("ข้อความสุดท้ายคือ HumanMessage ที่เป็นคำถาม");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: askWithPersona ต้องคืนข้อความคำตอบของ LLM
// แนวทาง: fakeLLM(["ตอบแล้ว"]) แล้ว toBe("ตอบแล้ว")
// ------------------------------------------------
test.todo("คืนข้อความคำตอบ");
// 👉 เขียน test ของข้อ 3 ตรงนี้
