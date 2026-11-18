import type { ProtocolEvent } from "@langchain/langgraph";
import { todo } from "@src/todo";

// เหตุการณ์ทั้งหมดที่อยู่ในช่อง (method) ที่ระบุ ตามลำดับเดิม
export function onChannel(events: ProtocolEvent[], method: string): ProtocolEvent[] {
  // 👉 ข้อ 1: คืนเฉพาะเหตุการณ์ที่ ev.method === method
  return todo(1);
}

// ชื่อ node ที่ "เริ่มทำงาน" ตามลำดับ: เหตุการณ์ช่อง tasks ของกราฟหลัก (namespace ว่าง)
// ที่ data มีคีย์ "input" (ตอนจบงานจะมี "result" แทน) คืนค่า data.name
export function startedNodes(events: ProtocolEvent[]): string[] {
  // 👉 ข้อ 2: กรองช่อง tasks ที่ ev.params.namespace.length === 0 และ "input" in data แล้วคืนรายการ name
  return todo(2);
}

export interface ToolRun {
  id: string;
  name: string;
  output: string;
}

// tool ที่ทำเสร็จแล้ว: จับคู่ tool-started (มีชื่อ) กับ tool-finished (มีผลลัพธ์) ด้วย tool_call_id
export function finishedTools(events: ProtocolEvent[]): ToolRun[] {
  // 👉 ข้อ 3: อ่านช่อง tools ตามลำดับ จำ tool_name จาก tool-started (key = tool_call_id)
  //          เมื่อเจอ tool-finished คืน { id: tool_call_id, name: ชื่อที่จำไว้, output: ข้อความของ ToolMessage }
  //          ข้อความอยู่ที่ data.output.content (เป็น string) ถ้าไม่ใช่ string ให้ใช้ JSON.stringify(content)
  return todo(3);
}
