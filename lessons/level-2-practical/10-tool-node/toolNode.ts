import type { AIMessage, ToolMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { todo } from "@src/todo";

export function makeToolNode(tools: StructuredToolInterface[]): ToolNode {
  // 👉 ข้อ 1: คืน new ToolNode(tools)
  return todo(1);
}

// รันทุก tool call ที่อยู่ใน aiMessage แล้วคืนรายการ ToolMessage
export async function executeCalls(
  tools: StructuredToolInterface[],
  aiMessage: AIMessage,
): Promise<ToolMessage[]> {
  const node = makeToolNode(tools);
  // 👉 ข้อ 2: เรียก node.invoke({ messages: [aiMessage] }) แล้วคืน .messages ของผลลัพธ์
  return todo(2);
}
