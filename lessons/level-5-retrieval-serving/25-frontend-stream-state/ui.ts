import { todo } from "@src/todo";

export type NodeState = "running" | "complete" | "error";

export interface NodeView {
  node: string;
  status: NodeState;
  error?: string;
}

export interface UiState {
  status: "idle" | "running" | "complete" | "error";
  nodes: NodeView[]; // เรียงตามลำดับที่เห็น node ครั้งแรก
  values: Record<string, unknown> | undefined;
  error?: string;
}

export interface StreamEvent {
  method: string;
  params: { namespace: string[]; data?: any };
}

export function initialUi(): UiState {
  return { status: "idle", nodes: [], values: undefined };
}

// ลดรูป event ทีละตัวเป็นสถานะ UI ใหม่ (ห้ามแก้ state เดิม)
export function reduceUi(state: UiState, event: StreamEvent): UiState {
  const root = event.params.namespace.length === 0;
  const data = event.params.data;

  // 👉 ข้อ 1: event ของ graph หลัก (root) เท่านั้นที่เกี่ยวกับสองกรณีนี้:
  //   method "lifecycle": data.event "running" → { ...state, status: "running", error: undefined }
  //                       "completed" → status "complete"   "failed" → status "error" พร้อม error: String(data.error)
  //   method "values": { ...state, values: data }
  //   event อื่นของ root ที่ไม่ตรงกรณีใด ให้ไปข้อ 2

  // 👉 ข้อ 2: method "custom:node-status" (ข้อมูล data = { node, status, error? })
  //   ถ้ายังไม่มี node นี้ → ต่อท้ายรายการ ถ้ามีแล้ว → แทนที่ตำแหน่งเดิม (ลำดับไม่เปลี่ยน) ค่า error ติดไปด้วยเมื่อมี
  //   data ผิดรูป (ไม่มี node เป็นสตริง หรือ status ไม่ใช่ running/complete/error) ให้ละเลย
  //   นอกเหนือจากนี้ทุกกรณี คืน state เดิม "ตัวเดียวกัน" (return state)
  return todo(1);
}

// เปอร์เซ็นต์ความคืบหน้า: จำนวน node ที่ "complete" / expectedTotal ปัดเป็นจำนวนเต็ม ไม่เกิน 100
export function progressPercent(nodes: NodeView[], expectedTotal: number): number {
  // 👉 ข้อ 3: expectedTotal < 1 ให้ถือเป็น 1 (กันหารด้วยศูนย์) คิดจากเฉพาะ node ที่ complete
  return todo(3);
}

// ปิดโครงสร้าง markdown ที่ค้างอยู่เพื่อให้เรนเดอร์ชั่วคราวได้
export function closeMarkdown(partial: string): string {
  // 👉 ข้อ 4: นับรั้วโค้ด ``` ถ้าจำนวนเป็นคี่ (กำลังอยู่ในโค้ดบล็อก) → ต่อท้าย "\n```" (ถ้าข้อความยังไม่จบด้วย "\n") แล้วจบ ไม่แตะเรื่องอื่น
  //          ถ้าไม่ได้อยู่ในโค้ดบล็อก: ลบรั้ว ``` ที่ปิดครบแล้วออกจากการนับก่อน จากนั้น
  //            นับ "**" ถ้าคี่ → ต่อท้าย "**"  แล้วนับ backtick เดี่ยว ` (ในข้อความที่ตัด ``` ออก) ถ้าคี่ → ต่อท้าย "`"
  //          (ทำตามลำดับ ** แล้ว ` ) ข้อความที่ครบถ้วนแล้วต้องคืนเหมือนเดิมทุกตัวอักษร
  return todo(4);
}

// เรียก reduceUi ต่อเนื่องกับ event หลายตัว (ให้ไว้แล้ว)
export function applyEvents(events: StreamEvent[], from: UiState = initialUi()): UiState {
  return events.reduce(reduceUi, from);
}

// ข้อความสถานะสั้น ๆ สำหรับหัวแถบ
export function headline(ui: UiState, expectedTotal: number): string {
  // 👉 ข้อ 5: "error" → `ล้มเหลว: ${ui.error ?? "ไม่ทราบสาเหตุ"}`   "complete" → "เสร็จแล้ว"   "idle" → "พร้อม"
  //          "running" → `กำลังทำงาน ${progressPercent(ui.nodes, expectedTotal)}%` ต่อด้วย ` (${ชื่อ node ที่ running อยู่ คั่นด้วย ", "})` ถ้ามี
  return todo(5);
}
