import { fakeLLM } from "../../../src/fakeLLM";
import { extractPerson } from "./extractPerson";

// ================================================
// บทที่ 13: structured output
// ฝึก: JSON + zod, rejects.toThrow
// ตัวอย่าง:
//   const llm = fakeLLM(['{"name":"มาลี","age":25}']);
//   expect(await extractPerson(llm, "มาลี อายุ 25")).toEqual({ name: "มาลี", age: 25 });
// รันกับ LLM จริง: npm run lesson 13
// ================================================

// ------------------------------------------------
// ข้อ 1: คำตอบ JSON ที่ถูกต้องต้องได้ { name, age } กลับมา
// แนวทาง: toEqual({ name: "มาลี", age: 25 })
// ------------------------------------------------
test.todo("JSON ถูกต้องได้ Person");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: คำตอบที่ไม่ใช่ JSON ต้อง throw ข้อความที่พูดถึง JSON
// แนวทาง: await expect(extractPerson(fakeLLM(["ไม่ใช่ json"]), "x")).rejects.toThrow(/JSON/)
// ------------------------------------------------
test.todo("ไม่ใช่ JSON ต้อง throw");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: JSON ที่ age เป็นข้อความ (ผิด schema) ต้อง throw ข้อความที่พูดถึง "รูปแบบ"
// แนวทาง: ใช้ rejects.toThrow(/รูปแบบ/)
// ------------------------------------------------
test.todo("ผิด schema ต้อง throw");
// 👉 เขียน test ของข้อ 3 ตรงนี้
