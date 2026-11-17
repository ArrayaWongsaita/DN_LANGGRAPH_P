import { AIMessage } from "@langchain/core/messages";
import { getTokenUsage } from "./usage";

// ================================================
// บทที่ 14: พารามิเตอร์และการใช้ token
// ฝึก: usage_metadata, toEqual
// ตัวอย่าง:
//   new AIMessage({ content: "x", usage_metadata: { input_tokens: 1, output_tokens: 2, total_tokens: 3 } })
// ลองเทียบ temperature 0 กับ 1 ด้วย LLM จริง: npm run lesson 14
// ================================================

// ------------------------------------------------
// ข้อ 1: อ่าน input/output/total จาก usage_metadata ได้ถูกต้อง
// แนวทาง: สร้าง AIMessage ที่มี usage_metadata แล้ว toEqual({ input, output, total })
// ------------------------------------------------
test.todo("อ่านจำนวน token");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: AIMessage ที่ไม่มี usage_metadata ต้องได้ 0 ทั้งหมด
// แนวทาง: new AIMessage("x")
// ------------------------------------------------
test.todo("ไม่มี usage_metadata ได้ 0");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: total ต้องเท่ากับ input + output (แม้ total_tokens ในข้อมูลจะไม่ตรง)
// แนวทาง: ใส่ total_tokens: 999 แล้วคาดว่า total เป็นผลบวก
// ------------------------------------------------
test.todo("total คือ input + output");
// 👉 เขียน test ของข้อ 3 ตรงนี้
