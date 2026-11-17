import type { BaseStore } from "@langchain/langgraph";
import { todo } from "@src/todo";

export interface Profile {
  name: string;
  lang: string;
}

export async function saveProfile(store: BaseStore, userId: string, profile: Profile): Promise<void> {
  // 👉 ข้อ 1: store.put(["profiles"], userId, profile)  (namespace ["profiles"], key = userId)
  todo(1);
}

export async function getProfile(store: BaseStore, userId: string): Promise<Profile | undefined> {
  // 👉 ข้อ 2: const item = await store.get(["profiles"], userId); คืน item?.value ถ้าไม่มี (null) ให้คืน undefined
  return todo(2);
}
