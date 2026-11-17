import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { todo } from "@src/todo";

export function buildAssistant(llm: BaseChatModel, tools: StructuredToolInterface[]) {
  // 👉 ข้อ 1: เรียก createAgent({ model: llm, tools, ... })
  // 👉 ข้อ 2: ใส่ systemPrompt: "คุณคือผู้ช่วยที่ตอบสั้น กระชับ"
  // 👉 ข้อ 3: ใส่ checkpointer: new MemorySaver()
  return todo(1);
}

export async function chat(agent: ReturnType<typeof buildAssistant>, threadId: string, text: string) {
  const result = await agent.invoke(
    { messages: [new HumanMessage(text)] },
    { configurable: { thread_id: threadId } },
  );
  return result.messages[result.messages.length - 1].text;
}
