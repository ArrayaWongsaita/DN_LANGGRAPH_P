import { randomUUID } from "node:crypto";
import type { BaseStore } from "@langchain/langgraph";

export async function remember(store: BaseStore, userId: string, text: string): Promise<void> {
  const key = randomUUID();
  await store.put(["memories", userId], key, { text });
}

export async function recall(store: BaseStore, userId: string): Promise<string[]> {
  const items = await store.search(["memories", userId]);
  return items.map((i) => i.value.text as string);
}
