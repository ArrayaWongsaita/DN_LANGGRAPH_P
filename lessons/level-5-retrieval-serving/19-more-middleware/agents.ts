import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { createAgent, llmToolSelectorMiddleware, todoListMiddleware, toolEmulatorMiddleware } from "langchain";
import { todo } from "@src/todo";

type AnyTool = StructuredToolInterface;

// agent ที่ให้ตัวคัดเลือกกรอง tool ก่อนส่งให้โมเดลหลัก
export function buildSelectiveAgent(llm: BaseChatModel, selectorLlm: BaseChatModel, tools: AnyTool[]) {
  // 👉 ข้อ 1: createAgent({ model: llm, tools, middleware: [llmToolSelectorMiddleware({ model: selectorLlm, maxTools: 2, alwaysInclude: ["search"] })] })
  //          (โมเดลคัดเลือกส่งเข้าเป็น model; ต้องแปลงชนิดด้วย `as never` เพราะชนิดของ option เข้มกว่า)
  return todo(1);
}

// agent วางแผนงานยาวด้วย to-do list
export function buildPlanner(llm: BaseChatModel) {
  // 👉 ข้อ 2: createAgent({ model: llm, tools: [], middleware: [todoListMiddleware()] })
  return todo(2);
}

// agent สำหรับทดสอบ: จำลอง tool ที่ระบุด้วยโมเดล ส่วน tool อื่นรันจริง
export function buildTestAgent(llm: BaseChatModel, emulatorLlm: BaseChatModel, tools: AnyTool[], emulate: string[]) {
  // 👉 ข้อ 3: createAgent({ model: llm, tools, middleware: [toolEmulatorMiddleware({ tools: emulate, model: emulatorLlm })] })
  //          (ใส่ `as never` ที่ model ของ emulator เช่นเดียวกับข้อ 1)
  return todo(3);
}

export interface TodoItem {
  content: string;
  status: "pending" | "in_progress" | "completed";
}

// ข้อความแผนสำหรับ UI: บรรทัดละหนึ่งงาน `${เลขที่เริ่มจาก 1}. [${ป้าย}] ${content}`
// ป้าย: pending → "รอ", in_progress → "กำลังทำ", completed → "เสร็จ"  รายการว่างคืน "(ยังไม่มีแผน)"
export function renderTodos(todos: TodoItem[] | undefined): string {
  // 👉 ข้อ 4: สร้างข้อความตามที่อธิบาย (undefined หรือว่าง → "(ยังไม่มีแผน)")
  return todo(4);
}

// ชื่อ tool ที่ควรจำลองตอนทดสอบ = tool ที่ "มีผลข้างเคียง" คือไม่อยู่ใน readOnly (รักษาลำดับเดิมของ tools)
export function toolsToEmulate(tools: { name: string }[], readOnly: string[]): string[] {
  // 👉 ข้อ 5: คืนชื่อของ tool ที่ name ไม่อยู่ใน readOnly (ปลอดภัยไว้ก่อน: tool ที่ไม่รู้จักถือว่ามีผลข้างเคียง)
  return todo(5);
}
