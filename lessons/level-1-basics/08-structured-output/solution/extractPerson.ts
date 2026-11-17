import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";

export const personSchema = z.object({ name: z.string(), age: z.number() });
export type Person = z.infer<typeof personSchema>;

export async function extractPerson(llm: BaseChatModel, text: string): Promise<Person> {
  const structured = llm.withStructuredOutput(personSchema);
  return structured.invoke(`ดึงชื่อและอายุจากข้อความนี้: ${text}`);
}
