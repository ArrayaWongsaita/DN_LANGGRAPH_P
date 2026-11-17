import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import type { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { createAgent } from "langchain";
import { z } from "zod";

export function makeNoteTools(store: string[]) {
  const addNote = tool(
    ({ text }: { text: string }) => {
      store.push(text);
      return `บันทึกแล้ว: ${text}`;
    },
    {
      name: "addNote",
      description: "จดโน้ตใหม่หนึ่งข้อความ",
      schema: z.object({ text: z.string().describe("ข้อความที่จะจด") }),
    },
  );
  const listNotes = tool(
    () => {
      return store.length === 0 ? "ยังไม่มีโน้ต" : store.map((n, i) => `${i + 1}. ${n}`).join("\n");
    },
    { name: "listNotes", description: "ดูโน้ตทั้งหมดที่จดไว้", schema: z.object({}) },
  );
  return [addNote, listNotes];
}

export function buildNoteAssistant(llm: BaseChatModel, store: string[], saver: SqliteSaver) {
  return createAgent({
    model: llm,
    tools: makeNoteTools(store),
    checkpointer: saver,
    systemPrompt: "คุณคือผู้ช่วยจดโน้ต ตอบสั้น ใช้ tool เมื่อผู้ใช้ขอจดหรือขอดูโน้ต",
  });
}

export async function say(agent: ReturnType<typeof buildNoteAssistant>, text: string): Promise<string> {
  const result = await agent.invoke(
    { messages: [new HumanMessage(text)] },
    { configurable: { thread_id: "me" } },
  );
  return result.messages[result.messages.length - 1].text;
}
