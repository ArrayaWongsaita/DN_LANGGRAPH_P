import { z } from "zod";
import { describeProvider } from "@src/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 0-04  (ต้องตั้ง key ใน .env)
// คำตอบของ LLM เป็น "ข้อความ" ถ้าอยากได้ข้อมูลเป็นโครงสร้างต้องแปลงและตรวจเอง
const { model, chatUrl, apiKey } = describeProvider();

const personSchema = z.object({ name: z.string(), age: z.number() });
type Person = z.infer<typeof personSchema>;

// LLM บางตัวชอบห่อ JSON ด้วยรั้วโค้ด ```json ... ``` ซึ่ง JSON.parse อ่านไม่ได้
function stripFence(text: string): string {
  // ข้อ 1: ตัดช่องว่างหัวท้าย แล้วถ้าข้อความถูกห่อด้วยรั้วโค้ด ให้ลอกรั้วออกเหลือแต่เนื้อใน
  //   รั้วคือบรรทัดเปิด ``` (อาจตามด้วยคำว่า json) และบรรทัดปิด ```
  //         return m ? m[1] : text.trim();
  const m = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return m ? m[1] : text.trim();
}

// แปลงคำตอบข้อความของ LLM ให้เป็นข้อมูล Person ที่ตรวจแล้ว
function parsePerson(text: string): Person {
  const cleaned = stripFence(text);
  // ข้อ 2: แปลง cleaned เป็น object ด้วย JSON.parse
  //          ถ้า parse ไม่ได้ ให้ throw Error ข้อความไทยที่มีคำว่า "JSON" เช่น "LLM ไม่ได้ตอบเป็น JSON: ..."
  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error(`LLM ไม่ได้ตอบเป็น JSON: ${text}`);
  }
  // ข้อ 3: ตรวจรูปร่างข้อมูลด้วย zod: คืน personSchema.parse(data) (ถ้าผิดมันจะ throw เอง)
  return personSchema.parse(data);
}

// ขอให้ LLM ดึงชื่อและอายุจากข้อความ แล้วใช้ parsePerson แปลงคำตอบ (ให้มาแล้ว)
const prompt = `ดึงชื่อและอายุจากข้อความนี้ ตอบเป็น JSON เท่านั้น รูปแบบ {"name": string, "age": number}\nข้อความ: คุณสมชาย อายุ 42 ปี อยู่เชียงใหม่`;
const res = await fetch(chatUrl, {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
});
const raw: string = (await res.json()).choices[0].message.content;
console.log("คำตอบดิบ:", raw);
const person = parsePerson(raw);
console.log("ข้อมูลที่ตรวจแล้ว:", person);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const fenced = "```json\n{\"name\":\"A\",\"age\":1}\n```";
check("stripFence ลอกรั้วโค้ดออก", stripFence(fenced) === '{"name":"A","age":1}', "ใช้ regex ตามแนวทาง");
check("stripFence ไม่ยุ่งกับข้อความที่ไม่มีรั้ว (แค่ตัดช่องว่าง)", stripFence('  {"a":1}  ') === '{"a":1}');
check("parsePerson อ่าน JSON ที่ห่อรั้วได้", parsePerson(fenced).name === "A");
let notJson = "";
try {
  parsePerson("ไม่ใช่ json เลย");
} catch (e) {
  notJson = (e as Error).message;
}
check("ข้อความที่ไม่ใช่ JSON: throw Error ที่มีคำว่า JSON", notJson.includes("JSON"), "ครอบ JSON.parse ด้วย try/catch");
let wrongShape = false;
try {
  parsePerson('{"name":"A","age":"สิบ"}');
} catch {
  wrongShape = true;
}
check("รูปร่างผิด (age เป็นข้อความ): zod จับได้", wrongShape, "personSchema.parse(data)");
check("ผลจาก LLM จริง: ชื่อสมชาย อายุ 42", person.name.includes("สมชาย") && person.age === 42);
