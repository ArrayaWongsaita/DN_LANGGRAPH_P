import type { BaseStore } from "@langchain/langgraph";

export interface Profile {
  name: string;
  lang: string;
}

export async function saveProfile(store: BaseStore, userId: string, profile: Profile): Promise<void> {
  await store.put(["profiles"], userId, profile);
}

export async function getProfile(store: BaseStore, userId: string): Promise<Profile | undefined> {
  const item = await store.get(["profiles"], userId);
  return (item?.value as Profile | undefined) ?? undefined;
}
