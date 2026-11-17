import { createHash } from "node:crypto";
import type { BaseCheckpointSaver } from "@langchain/langgraph";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { todo } from "@src/todo";

export const MAX_THREAD_ID = 255;

// สร้าง saver จากลิงก์เชื่อมต่อ (ยังไม่เชื่อมต่อจนกว่าจะใช้งาน)
export function makePostgresSaver(connectionString: string): PostgresSaver {
  // 👉 ข้อ 1: คืน PostgresSaver.fromConnString(connectionString)
  return todo(1);
}

const State = new StateSchema({ messages: MessagesValue });

// แอปแชตเรียบง่าย: นับจำนวนข้อความในประวัติแล้วตอบ
export function buildChatApp(checkpointer: BaseCheckpointSaver) {
  const builder = new StateGraph(State)
    .addNode("reply", (state) => ({ messages: [{ role: "assistant", content: `ฉันจำได้ ${state.messages.length} ข้อความ` }] }))
    .addEdge(START, "reply")
    .addEdge("reply", END);
  // 👉 ข้อ 2: คืน builder.compile({ checkpointer })
  return todo(2);
}

// ถ้า thread_id ยาวเกิน MAX_THREAD_ID ให้เปลี่ยนเป็น "t_" + sha256 (hex) ของมัน ไม่เช่นนั้นคืนค่าเดิม
export function safeThreadId(id: string): string {
  // 👉 ข้อ 3: ใช้ createHash("sha256").update(id).digest("hex")
  return todo(3);
}
