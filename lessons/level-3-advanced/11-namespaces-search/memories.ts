import { randomUUID } from "node:crypto";
import type { BaseStore } from "@langchain/langgraph";
import { todo } from "@src/todo";

export async function remember(store: BaseStore, userId: string, text: string): Promise<void> {
  const key = randomUUID();
  // 👉 ข้อ 1: store.put(["memories", userId], key, { text })
  todo(1);
}

export async function recall(store: BaseStore, userId: string): Promise<string[]> {
  // 👉 ข้อ 2: items = await store.search(["memories", userId]) แล้วคืน items.map((i) => i.value.text)
  return todo(2);
}
