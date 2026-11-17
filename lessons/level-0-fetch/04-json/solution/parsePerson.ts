import { z } from "zod";

export const personSchema = z.object({ name: z.string(), age: z.number() });
export type Person = z.infer<typeof personSchema>;

export function stripFence(text: string): string {
  const m = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return m ? m[1] : text.trim();
}

export function parsePerson(text: string): Person {
  const cleaned = stripFence(text);
  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error(`LLM ไม่ได้ตอบเป็น JSON: ${text}`);
  }
  return personSchema.parse(data);
}

interface ExtractArgs {
  fetchFn: typeof fetch;
  url: string;
  apiKey: string;
  model: string;
  text: string;
}

export async function extractPerson({ fetchFn, url, apiKey, model, text }: ExtractArgs): Promise<Person> {
  const prompt = `ดึงชื่อและอายุจากข้อความนี้ ตอบเป็น JSON เท่านั้น รูปแบบ {"name": string, "age": number}\nข้อความ: ${text}`;
  const res = await fetchFn(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  return parsePerson(data.choices[0].message.content);
}
