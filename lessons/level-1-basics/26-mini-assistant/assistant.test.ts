import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { fakeLLM } from "../../../src/fakeLLM";
import { buildAssistantGraph } from "./assistant";

// ================================================
// บทที่ 26: โปรเจกต์เล็ก: ผู้ช่วยตอบคำถาม
// ฝึก: รวมทุกอย่างของ Level 1 (state, node, edge, LLM, router)
// graph: START -> classify -> respond -> format -> END
// ตัวอย่าง:
//   const r = await buildAssistantGraph(fakeLLM(["คำตอบ"])).invoke({ question: "ถาม" });
//   // r.kind === "short"
// รันคุยจริง: npm run lesson 26
// ================================================

// ------------------------------------------------
// ข้อ 1: classify: คำถามยาว 20 ตัวอักษรได้ kind เป็น "short" และ 21 ตัวอักษรได้ "long"
// แนวทาง: "a".repeat(20) / "a".repeat(21) แล้วดู result.kind
// ------------------------------------------------
test.todo("classify แยกสั้น/ยาว");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: respond ต้องส่ง SystemMessage ก่อน แล้วตามด้วย HumanMessage ที่เป็นคำถาม
// แนวทาง: vi.spyOn(llm, "invoke") แล้วอ่าน spy.mock.calls[0][0] (เหมือนบทที่ 08)
// ------------------------------------------------
test.todo("ส่ง system แล้วตามด้วยคำถาม");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: format ต้องต่อท้ายคำตอบด้วยบรรทัด "— ตอบโดยผู้ช่วย LangGraph"
// แนวทาง: คำตอบจะเป็น "คำตอบ\n— ตอบโดยผู้ช่วย LangGraph" เมื่อ LLM ตอบ "คำตอบ"
// ------------------------------------------------
test.todo("format ต่อท้ายลายเซ็น");
// 👉 เขียน test ของข้อ 3 ตรงนี้
