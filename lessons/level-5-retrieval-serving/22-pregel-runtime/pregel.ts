import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

// diamond: a → (b, c) → d  ทุก node เขียนบันทึกลงฟิลด์ log
// withReducer = true → log รวมค่าด้วย reducer, false → log เป็นฟิลด์ธรรมดา (LastValue)
export function buildDiamond(withReducer: boolean) {
  // 👉 ข้อ 1: State ที่มีฟิลด์ log:
  //   withReducer → new ReducedValue(z.array(z.string()).default(() => []), { inputSchema: z.string(), reducer: (a, b) => [...a, b] })
  //   ไม่ใช่ → z.array(z.string()).default(() => [])  แล้วสร้าง StateGraph(State) จากนั้นต่อ node a,b,c,d
  //   โดย node ตัวไหนก็ตามคืน { log: <ชื่อ node> } (withReducer) หรือ { log: [<ชื่อ node>] } (ไม่ใช่)
  //   edge: START→a, a→b, a→c, b→d, c→d, d→END  คอมไพล์แล้วคืนกราฟ
  return todo(1);
}

export interface DebugEvent {
  type: string;
  step: number;
  payload?: { name?: string };
}

export async function recordDebug(graph: ReturnType<typeof buildDiamond>): Promise<DebugEvent[]> {
  const events: DebugEvent[] = [];
  for await (const e of await graph.stream({}, { streamMode: "debug" })) events.push(e as unknown as DebugEvent);
  return events;
}

// จัดกลุ่ม node ตามรอบ (superstep) จาก event ชนิด "task" เท่านั้น เรียงเลขรอบน้อย→มาก ชื่อ node ในรอบเรียงตามตัวอักษร
export function groupSupersteps(events: DebugEvent[]): { step: number; nodes: string[] }[] {
  // 👉 ข้อ 2: กรอง e.type === "task" (ข้ามถ้าไม่มี payload.name) จัดกลุ่มตาม e.step แล้วคืน [{ step, nodes }] ตามที่อธิบาย
  return todo(2);
}

// จำนวน node ที่รันขนานกันมากที่สุดในรอบเดียว (ไม่มีรอบเลย = 0)
export function maxParallelism(steps: { nodes: string[] }[]): number {
  // 👉 ข้อ 3
  return todo(3);
}

// ชื่อที่ซ้ำกันระหว่างชื่อ node กับชื่อฟิลด์ State (คืนตามลำดับใน nodeNames ไม่ซ้ำ)
export function findNameClashes(nodeNames: string[], stateKeys: string[]): string[] {
  // 👉 ข้อ 4
  return todo(4);
}

// error นี้คือ "สอง node เขียนฟิลด์ LastValue เดียวกันในรอบเดียว" ใช่ไหม
export function isConcurrentUpdateError(error: unknown): boolean {
  // 👉 ข้อ 5: true ถ้า (error as { lc_error_code?: string }).lc_error_code === "INVALID_CONCURRENT_GRAPH_UPDATE"
  //          หรือข้อความมี "can only receive one value per step" นอกนั้น false (รวม null/ไม่ใช่ error)
  return todo(5);
}

// เหลือเฉพาะ channel ของผู้ใช้ (ฟิลด์ State) โดยตัด channel ภายในของ runtime ที่ขึ้นต้นด้วย "__", "branch:", "join:" หรือ "start:"
export function userChannels(channelNames: string[]): string[] {
  // 👉 ข้อ 6
  return todo(6);
}
