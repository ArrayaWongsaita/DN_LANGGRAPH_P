import { fakeLLM } from "../../../src/fakeLLM";
import { collectStream } from "./streamText";

// ================================================
// บทที่ 12: streaming
// ฝึก: for await, llm.stream, vi.fn
// fakeLLM ก็ stream ได้ (ทีละตัวอักษร)
// ตัวอย่าง:
//   const chunks = await collectStream(fakeLLM(["abc"]), "q");
//   expect(chunks.join("")).toBe("abc");
// รันกับ LLM จริง: npm run lesson 12
// ================================================

// ------------------------------------------------
// ข้อ 1: chunk ทั้งหมดต่อกันต้องได้คำตอบเต็ม
// แนวทาง: chunks.join("") แล้ว toBe(...)
// ------------------------------------------------
test.todo("chunk ต่อกันได้คำตอบเต็ม");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: ต้องได้มากกว่าหนึ่ง chunk
// แนวทาง: expect(chunks.length).toBeGreaterThan(1)
// ------------------------------------------------
test.todo("ได้มากกว่าหนึ่ง chunk");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: onChunk ต้องถูกเรียกหนึ่งครั้งต่อหนึ่ง chunk
// แนวทาง: const onChunk = vi.fn(); แล้ว toHaveBeenCalledTimes(chunks.length)
// ------------------------------------------------
test.todo("onChunk เรียกครั้งต่อ chunk");
// 👉 เขียน test ของข้อ 3 ตรงนี้
