import { randomUUID } from "node:crypto";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseStore } from "@langchain/langgraph";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

export function memoryNamespace(userId: string): string[] {
  return [userId, "memories"];
}

export async function remember(store: BaseStore, userId: string, text: string): Promise<string> {
  const key = randomUUID();
  await store.put(memoryNamespace(userId), key, { text });
  return key;
}

export async function recall(store: BaseStore, userId: string, query: string, k = 3, minScore = 0.3): Promise<string[]> {
  const hits = await store.search(memoryNamespace(userId), { query, limit: k });
  return hits.filter((hit) => (hit.score ?? 0) >= minScore).map((hit) => String(hit.value.text));
}

const State = new StateSchema({
  userId: z.string().default(""),
  question: z.string().default(""),
  answer: z.string().default(""),
});

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
