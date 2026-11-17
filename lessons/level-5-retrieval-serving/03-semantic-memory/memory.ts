import { randomUUID } from "node:crypto";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseStore } from "@langchain/langgraph";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

export function memoryNamespace(userId: string): string[] {
  // 👉 ข้อ 1: คืน [userId, "memories"] (แยกผู้ใช้ด้วย namespace)
  return todo(1);
}

export async function remember(store: BaseStore, userId: string, text: string): Promise<string> {
  // 👉 ข้อ 2: key = randomUUID() แล้ว await store.put(memoryNamespace(userId), key, { text }) และคืน key
  return todo(2);
}

export async function recall(store: BaseStore, userId: string, query: string, k = 3, minScore = 0.3): Promise<string[]> {
  // 👉 ข้อ 3: hits = await store.search(memoryNamespace(userId), { query, limit: k })
  //          เก็บเฉพาะที่ (score ?? 0) >= minScore แล้วคืน text ของแต่ละอัน (hit.value.text เป็น string)
  return todo(3);
}

const State = new StateSchema({
  userId: z.string().default(""),
  question: z.string().default(""),
  answer: z.string().default(""),
});

// (ให้ไว้แล้ว) บอทที่ระลึกความจำก่อนตอบ
export function buildMemoryBot(llm: BaseChatModel, store: BaseStore) {
  return new StateGraph(State)
    .addNode("respond", async (state) => {
      const memories = await recall(store, state.userId, state.question);
      const context = memories.length > 0 ? `สิ่งที่รู้เกี่ยวกับผู้ใช้:\n- ${memories.join("\n- ")}\n` : "";
      const reply = await llm.invoke(`${context}คำถาม: ${state.question}`);
      return { answer: reply.text };
    })
    .addEdge(START, "respond")
    .addEdge("respond", END)
    .compile();
}
