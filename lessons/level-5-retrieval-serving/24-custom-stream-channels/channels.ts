import { END, START, StateGraph, StateSchema, StreamChannel } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

export interface NodeStatus {
  node: string;
  status: "running" | "complete" | "error";
  error?: string;
}

export interface ProtocolEvent {
  method: string;
  params: { namespace: string[]; data?: any };
}

// แปลง event ชนิด "tasks" ของ graph หลัก (namespace ว่าง) เป็นสถานะของ node
export function nodeStatusFromEvent(event: ProtocolEvent): NodeStatus | null {
  // 👉 ข้อ 1: method ต้องเป็น "tasks", params.namespace ต้องว่าง และ data.name ต้องเป็นสตริง ไม่งั้นคืน null
  //          data มีคีย์ "result" → { node, status: "complete" }
  //          data.error ไม่ใช่ null/undefined → { node, status: "error", error: String(data.error?.message ?? data.error) }  (ตรวจข้อนี้ก่อนข้อ result)
  //          data มีคีย์ "input" → { node, status: "running" }   นอกนั้น null
  return todo(1);
}

// factory ของ transformer (เรียกใหม่ทุกครั้งที่รัน)
export function createNodeStatusTransformer() {
  return () => {
    const channel = StreamChannel.remote<NodeStatus>("node-status");
    const running = new Set<string>();
    return {
      init: () => ({ nodeStatus: channel }),
      process(event: ProtocolEvent): boolean {
        // 👉 ข้อ 2: s = nodeStatusFromEvent(event) ถ้ามี → channel.push(s) และอัปเดต running
        //          (เพิ่มเมื่อ "running" ลบเมื่อ "complete"/"error")
        //          ถ้าเป็น event method "lifecycle" ของ namespace ว่างที่ data.event === "failed"
        //          → push { node, status: "error", error: String(data.error) } ให้ทุก node ที่ยังอยู่ใน running แล้วล้าง running
        //          ท้ายสุดคืน true เสมอ (ปล่อย event เดิมไหลต่อ)
        return todo(2);
      },
    };
  };
}

const State = new StateSchema({ text: z.string().default("") });

// graph plan → work → report ที่ติดตั้ง transformer; ถ้า failAt ตรงชื่อ node จะ throw Error("boom")
export function buildObservedGraph(failAt?: string) {
  const step = (name: string) => () => {
    if (name === failAt) throw new Error("boom");
    return { text: name };
  };
  // 👉 ข้อ 3: new StateGraph(State) ใส่ node "plan", "work", "report" (ใช้ step(ชื่อ)) ต่อ START→plan→work→report→END
  //          compile({ transformers: [createNodeStatusTransformer()] })  (ชื่อ option คือ transformers)
  return todo(3);
}

export interface Collected {
  statuses: NodeStatus[];
  failed: boolean;
}

// รัน graph ด้วย streamEvents v3 เก็บข้อมูลจาก event "custom:node-status" (อยู่ที่ params.data) ตามลำดับ
export async function collectNodeStatuses(graph: ReturnType<typeof buildObservedGraph>, input: object = {}): Promise<Collected> {
  const statuses: NodeStatus[] = [];
  let failed = false;
  // 👉 ข้อ 4: const run = await graph.streamEvents(input, { version: "v3" }); วนอ่าน event เก็บเฉพาะ method === "custom:node-status"
  //          ถ้าการวนอ่านโยน error (graph ล้ม) ให้จับไว้ ตั้ง failed = true แล้วคืนผลที่เก็บได้ (ห้ามโยนต่อ)
  return todo(4);
}

// สถานะล่าสุดของแต่ละ node เรียงตามลำดับที่เห็น node ครั้งแรก
export function latestByNode(statuses: NodeStatus[]): NodeStatus[] {
  // 👉 ข้อ 5
  return todo(5);
}
