import { z } from "zod";
import { todo } from "@src/todo";

export const personSchema = z.object({ name: z.string(), age: z.number() });
export type Person = z.infer<typeof personSchema>;

// LLM บางตัวชอบห่อ JSON ด้วยรั้วโค้ด ```json ... ``` ซึ่ง JSON.parse อ่านไม่ได้
export function stripFence(text: string): string {
  // 👉 ข้อ 1: ตัดช่องว่างหัวท้าย แล้วถ้าข้อความถูกห่อด้วยรั้วโค้ด ให้ลอกรั้วออกเหลือแต่เนื้อใน
  //   รั้วคือบรรทัดเปิด ``` (อาจตามด้วยคำว่า json) และบรรทัดปิด ```
  // แนวทาง: const m = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  //         return m ? m[1] : text.trim();
  return todo(1);
}

// แปลงคำตอบข้อความของ LLM ให้เป็นข้อมูล Person ที่ตรวจแล้ว
export function parsePerson(text: string): Person {
  const cleaned = stripFence(text);

  // 👉 ข้อ 2: แปลง cleaned เป็น object ด้วย JSON.parse
  //          ถ้า parse ไม่ได้ ให้ throw Error ข้อความไทยที่มีคำว่า "JSON" เช่น "LLM ไม่ได้ตอบเป็น JSON: ..."
  // แนวทาง: try { data = JSON.parse(cleaned) } catch { throw new Error(`LLM ไม่ได้ตอบเป็น JSON: ${text}`) }
  const data: unknown = todo(2);

  // 👉 ข้อ 3: ตรวจรูปร่างข้อมูลด้วย zod: คืน personSchema.parse(data) (ถ้าผิดมันจะ throw เอง)
  return todo(3);
}

interface ExtractArgs {
  fetchFn: typeof fetch;
  url: string;
  apiKey: string;
  model: string;
  text: string;
}

// ส่วนนี้ให้มาแล้ว: ขอให้ LLM ดึงชื่อและอายุจากข้อความ แล้วใช้ parsePerson แปลงคำตอบ
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
