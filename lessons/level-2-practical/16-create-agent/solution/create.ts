import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";

export function buildAssistant(llm: BaseChatModel, tools: StructuredToolInterface[]) {
  return createAgent({
    model: llm,
    tools,
    systemPrompt: "คุณคือผู้ช่วยที่ตอบสั้น กระชับ",
    checkpointer: new MemorySaver(),
  });
}

export async function chat(agent: ReturnType<typeof buildAssistant>, threadId: string, text: string) {
  const result = await agent.invoke(
    { messages: [new HumanMessage(text)] },
    { configurable: { thread_id: threadId } },
  );
  return result.messages[result.messages.length - 1].text;
}
