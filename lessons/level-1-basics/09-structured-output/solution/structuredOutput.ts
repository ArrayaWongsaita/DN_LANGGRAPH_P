import { z } from "zod";
import { llm } from "../../02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 09

// รูปร่างข้อมูลที่เราอยากได้ (บอกด้วย zod)
const personSchema = z.object({ name: z.string(), age: z.number() });
type Person = z.infer<typeof personSchema>;

// ข้อ 1: ทำให้ llm ตอบเป็นโครงสร้างตาม personSchema (ได้ "ตัวเรียก" ตัวใหม่ที่ตอบเป็น object)
const structured = llm.withStructuredOutput(personSchema, { method: "functionCalling" });

// ข้อ 2: เรียก structured ด้วยข้อความที่มีต้นฉบับ แล้วเก็บผลลัพธ์
const text = "คุณสมชาย อายุ 42 ปี อยู่เชียงใหม่";
const person = await structured.invoke(`ดึงชื่อและอายุจากข้อความนี้: ${text}`);

console.log(person);
console.log(`ชื่อ: ${person.name}, อายุ: ${person.age}`);
check("ได้ name เป็นข้อความ", typeof person.name === "string" && person.name.length > 0, "ผลลัพธ์ต้องเป็น object { name, age }");
check("ได้ age เป็นตัวเลข 42", person.age === 42, "age ต้องเป็นตัวเลข ไม่ใช่ข้อความ");
