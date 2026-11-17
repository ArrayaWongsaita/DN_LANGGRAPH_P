import { fakeLLM } from "../../../src/fakeLLM";
import { buildAnswerGraph, makeAnswerNode } from "./answerNode";

// ================================================
// บทที่ 19: node ที่เรียก LLM
// ฝึก: ส่ง llm เข้าไปใน node, fakeLLM
// ตัวอย่าง:
//   const graph = buildAnswerGraph(fakeLLM(["คำตอบ"]));
//   await graph.invoke({ question: "ถาม" });
// รันกับ LLM จริง: npm run lesson 19
// ================================================

// ------------------------------------------------
// ข้อ 1: answer ใน state สุดท้ายต้องเท่ากับคำตอบของ LLM
// แนวทาง: fakeLLM(["คำตอบ"]) แล้วดู result.answer
// ------------------------------------------------
test.todo("answer เท่ากับคำตอบของ LLM");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: question ต้องไม่ถูกเปลี่ยน
// แนวทาง: ดู result.question
// ------------------------------------------------
test.todo("question ไม่ถูกเปลี่ยน");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: node จาก makeAnswerNode(llm) เรียกตรง ๆ ต้องคืนเฉพาะ { answer }
// แนวทาง: await node({ question: "q", answer: "" }) แล้ว toEqual({ answer: "x" })
// ------------------------------------------------
test.todo("node คืนเฉพาะ answer");
// 👉 เขียน test ของข้อ 3 ตรงนี้
