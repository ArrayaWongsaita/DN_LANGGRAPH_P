import type { ProtocolEvent } from "@langchain/langgraph";
import { todo } from "@src/todo";

export type Progress =
  | { type: "node"; node: string }
  | { type: "tool-start"; tool: string; input: string }
  | { type: "tool-end"; tool: string; output: string }
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

const isRoot = (ev: ProtocolEvent) => ev.params.namespace.length === 0;

// 👉 ข้อ 1: node เริ่มทำงาน = ช่อง "tasks" ของกราฟหลัก (namespace ว่าง) ที่ data มีคีย์ "input"
//          คืน { type: "node", node: data.name } ไม่ใช่ก็คืน null (ห้ามส่ง input ออกไป)
function nodeProgress(ev: ProtocolEvent): Progress | null {
  return todo(1);
}

// 👉 ข้อ 2: ช่อง "tools": tool-started → จำชื่อใน names (key = tool_call_id) แล้วคืน { type: "tool-start", tool, input }
//          tool-finished → คืน { type: "tool-end", tool: ชื่อที่จำไว้ ("?" ถ้าไม่เคยเห็น), output: data.output.content ถ้าเป็น string ไม่ก็ JSON.stringify }
function toolProgress(ev: ProtocolEvent, names: Map<string, string>): Progress | null {
  return todo(2);
}

// 👉 ข้อ 3: ช่อง "messages" ที่ data.event === "content-block-delta" และ data.delta.type === "text-delta"
//          และ data.delta.text ไม่ใช่สตริงว่าง → { type: "token", text } นอกนั้น null
function tokenProgress(ev: ProtocolEvent): Progress | null {
  return todo(3);
}

// (ให้ไว้แล้ว) กราฟหลักเท่านั้น: completed → done, failed → error
function lifecycleProgress(ev: ProtocolEvent): Progress | null {
  if (ev.method !== "lifecycle" || !isRoot(ev)) return null;
  const data = ev.params.data as { event: string; error?: string };
  if (data.event === "completed") return { type: "done" };
  if (data.event === "failed") return { type: "error", message: data.error ?? "ไม่ทราบสาเหตุ" };
  return null;
}

// ตัวแปลที่มีสถานะ (จำชื่อ tool) เหตุการณ์ที่ไม่รู้จักคืน null
export function createMapper(): (ev: ProtocolEvent) => Progress | null {
  const names = new Map<string, string>();
  return (ev) => nodeProgress(ev) ?? toolProgress(ev, names) ?? tokenProgress(ev) ?? lifecycleProgress(ev);
}

export async function* progressStream(run: AsyncIterable<ProtocolEvent>): AsyncGenerator<Progress> {
  const map = createMapper();
  // 👉 ข้อ 4: วนอ่าน run ด้วย for await แปลงทีละเหตุการณ์ yield เฉพาะที่ไม่ใช่ null
  //          ครอบด้วย try/catch: ถ้าวนอ่าน throw และ "ยังไม่เคย yield error" ให้ yield { type: "error", message: ข้อความของ error }
  //          (กราฟล้มจะมี lifecycle failed มาก่อน throw ต้องไม่ส่ง error ซ้ำ)
  todo(4);
}
