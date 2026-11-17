import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import type { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { createAgent } from "langchain";
import { todo } from "@src/todo";
import { z } from "zod";

export function makeNoteTools(store: string[]) {
  const addNote = tool(
    ({ text }: { text: string }) => {
      // 👉 ข้อ 1: เก็บ text ลงใน store แล้วคืน `บันทึกแล้ว: ${text}`
      return todo(1);
    },
    {
      name: "addNote",
      description: "จดโน้ตใหม่หนึ่งข้อความ",
      schema: z.object({ text: z.string().describe("ข้อความที่จะจด") }),
    },
  );
  const listNotes = tool(
    () => {
      // 👉 ข้อ 2: ถ้า store ว่างคืน "ยังไม่มีโน้ต" ไม่เช่นนั้นคืนโน้ตทั้งหมดต่อกันบรรทัดละข้อ เช่น "1. ก\n2. ข"
      return todo(2);
    },
    { name: "listNotes", description: "ดูโน้ตทั้งหมดที่จดไว้", schema: z.object({}) },
  );
  return [addNote, listNotes];
}

export function buildNoteAssistant(llm: BaseChatModel, store: string[], saver: SqliteSaver) {
  // 👉 ข้อ 3: createAgent ด้วย model: llm, tools: makeNoteTools(store), checkpointer: saver
  //          และ systemPrompt: "คุณคือผู้ช่วยจดโน้ต ตอบสั้น ใช้ tool เมื่อผู้ใช้ขอจดหรือขอดูโน้ต"
  return todo(3);
}

export async function say(agent: ReturnType<typeof buildNoteAssistant>, text: string): Promise<string> {
  const result = await agent.invoke(
    { messages: [new HumanMessage(text)] },
    { configurable: { thread_id: "me" } },
  );
  return result.messages[result.messages.length - 1].text;
}
