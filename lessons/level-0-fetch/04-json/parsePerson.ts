import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

const personSchema = z.object({ name: z.string(), age: z.number() });
type Person = z.infer<typeof personSchema>;

function parsePerson(raw: string): Person {
  const text = raw.trim();
  const json = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)?.[1] ?? text;
  let data: unknown;

  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("อ่านคำตอบเป็น JSON ไม่ได้");
  }

  // 👉 ข้อ 1 ใช้ personSchema ตรวจ data แล้วคืนค่าที่ผ่าน schema
  return todo(1);
}

// จำลอง body จาก fetch โดยให้ข้อความของโมเดลอยู่ใน choices[0].message.content
const samples = [
  { label: "JSON ตรง ๆ", raw: '{"name":"มาลี","age":42}' },
  { label: "JSON ในรั้วโค้ด", raw: '```json\n{"name":"มาลี","age":42}\n```' },
  { label: "อายุเป็นข้อความ", raw: '{"name":"มาลี","age":"42"}' },
  { label: "ข้อความธรรมดา", raw: "มาลีอายุ 42 ปี" },
];
const people: Person[] = [];
const errors: unknown[] = [];

for (const { label, raw } of samples) {
  const response = Response.json({ choices: [{ message: { content: raw } }] });
  const data = await response.json();

  try {
    const person = parsePerson(data.choices[0].message.content);
    people.push(person);
    console.log(`[${label}] ${JSON.stringify(person)}`);
  } catch (error) {
    errors.push(error);
    if (error instanceof z.ZodError) {
      const fields = error.issues.map((issue) => issue.path.join(".")).join(", ");
      console.log(`[${label}] ข้อมูลไม่ตรงกับ schema ที่ฟิลด์ ${fields || "(ทั้งก้อน)"}`);
    } else if (error instanceof Error && error.message === "อ่านคำตอบเป็น JSON ไม่ได้") {
      console.log(`[${label}] ${error.message}`);
    } else {
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
// ─────────────────────────────────────────────────────────────
check("อ่าน JSON ได้ทั้งแบบตรง ๆ และแบบมีรั้ว", people.length === 2 && people.every(({ name, age }) => name === "มาลี" && age === 42));
check("จับชนิดข้อมูลที่ผิดตรงฟิลด์ age", errors[0] instanceof z.ZodError && errors[0].issues.some((issue) => issue.path[0] === "age"));
check("แยกข้อความที่อ่านเป็น JSON ไม่ได้", errors[1] instanceof Error && errors[1].message === "อ่านคำตอบเป็น JSON ไม่ได้");
