import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { type AIMessage, HumanMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { todo } from "@src/todo";

export async function askWithTools(
  llm: BaseChatModel,
  tools: StructuredToolInterface[],
  question: string,
): Promise<AIMessage> {
  // 👉 ข้อ 1: ผูก tools ให้ llm ด้วย llm.bindTools!(tools)
  const bound = todo(1);
  // 👉 ข้อ 2: เรียก bound.invoke ด้วยข้อความของผู้ใช้ (new HumanMessage(question)) แล้วคืนผล
  return todo(2);
}

export interface ToolCallRequest {
  name: string;
  args: Record<string, unknown>;
}

// รัน tool ตามคำขอ: หา tool ที่ชื่อตรงกันใน tools แล้วเรียก .invoke(call.args)
export async function runToolCall(
  tools: StructuredToolInterface[],
  call: ToolCallRequest,
): Promise<string> {
  // 👉 ข้อ 3: หา tool จาก name, ถ้าไม่เจอให้ throw Error(`ไม่มี tool ชื่อ ${call.name}`), เจอแล้วคืนผล invoke
  return todo(3);
}
