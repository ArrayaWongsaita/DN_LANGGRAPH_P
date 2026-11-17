import { HumanMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { todo } from "@src/todo";

export function buildCalculator(model: BaseChatModel) {
  // 👉 ข้อ 1: คืน createAgent({ model, tools: [makeAddTool()] })
  return todo(1);
}

// ถามเครื่องคิดเลข: ถ้าโมเดลล้ม ให้ตอบ "ขออภัย ระบบขัดข้อง" แทนที่จะโยน error
export async function ask(agent: ReturnType<typeof buildCalculator>, question: string): Promise<string> {
  try {
    const result = await agent.invoke({ messages: [new HumanMessage(question)] });
    return result.messages[result.messages.length - 1].text;
  } catch {
    // 👉 ข้อ 2: คืนข้อความ "ขออภัย ระบบขัดข้อง"
    return todo(2);
  }
}
