import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";

// ส่งคำถามแบบ "ข้อความของมนุษย์" แล้วสรุปว่าคำตอบที่ได้เป็นข้อความชนิดไหน
export async function describeReply(
  llm: BaseChatModel,
  question: string,
): Promise<{ type: string; text: string }> {
  // 👉 ข้อ 1: ห่อคำถามเป็น HumanMessage แล้วส่งให้ llm.invoke (ส่งเป็น array ที่มีข้อความเดียว)
  // แนวทาง: await llm.invoke([new HumanMessage(question)])
  const reply = todo(1);

  // 👉 ข้อ 2: คืน { type, text } โดย type คือชนิดของข้อความ (reply.type) และ text คือ reply.text
  return todo(2);
}
