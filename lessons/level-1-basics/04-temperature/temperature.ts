import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { todo } from "@src/todo";
import { ChatGroq } from "@langchain/groq"; // ตัวอย่างใช้ Groq ถ้าเลือกเจ้าอื่นในบท 02 ให้เปลี่ยน import กับ new ... ตามบล็อกของเจ้านั้น
import { check } from "@src/check";
import { env } from "../01-env-schema/env";

// รันด้วย: pnpm lesson 04
// บทนี้สร้าง chat model ของตัวเองในไฟล์นี้ (ไม่ใช้ llm จากบท 02) เพราะต้องสร้างหลายตัวที่ตั้ง temperature ต่างกัน
// temperature = ปุ่มปรับความสุ่มของคำตอบ: ต่ำ (0) = นิ่ง คาดเดาได้ / สูง (เช่น 1.5) = หลากหลาย สร้างสรรค์

const question = "ตั้งชื่อสัตว์เลี้ยงหนึ่งชื่อ ตอบแค่ชื่อเดียว";
const results: Record<number, string[]> = {};

const temperatures = [0, 1.5];
const models: BaseChatModel[] = [];

for (const temperature of temperatures) {
  // 👉 ข้อ 1: สร้าง chat model ใหม่ที่ตั้ง temperature = ค่าของรอบนี้ (ใส่ temperature ตอนสร้าง)
  // แนวทาง: new ChatGroq({ model: env.LLM_MODEL || "openai/gpt-oss-20b", apiKey: env.GROQ_API_KEY, temperature })
  const model: BaseChatModel = todo(1);

  models.push(model);
  const answers: string[] = [];
  for (let i = 0; i < 3; i++) {
    // 👉 ข้อ 2: ถามคำถามเดิมด้วย model นี้ แล้วเก็บข้อความตอบ (.text ตัดช่องว่างหัวท้าย) ลง answers
    // แนวทาง: const reply = await model.invoke(question);  answers.push(reply.text.trim());
    todo(2);
  }

  results[temperature] = answers;
  console.log(`temperature ${temperature}:`, answers);
}

const distinct = (a: string[]) => new Set(a).size;
console.log(`จำนวนคำตอบที่ไม่ซ้ำ (จาก 3 ครั้ง): temperature 0 = ${distinct(results[0])}, temperature 1.5 = ${distinct(results[1.5])}`);
console.log("(ปกติค่าต่ำจะซ้ำกันมากกว่า แต่ไม่รับประกัน: บางโมเดลตอบไม่ซ้ำเป๊ะแม้ตั้ง 0)");

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
temperatures.forEach((temperature, i) =>
  check(
    `model ถูกตั้ง temperature = ${temperature}`,
    (models[i] as { temperature?: number }).temperature === temperature,
    "ใส่ temperature ในตัวสร้าง chat model",
  ),
);
check(
  "ได้คำตอบครบ 3 ข้อความที่ไม่ว่างในทั้งสองค่า",
  Object.values(results).every((a) => a.length === 3 && a.every((t) => t.length > 0)),
  "เก็บ reply.text ลง answers ให้ครบ 3 ครั้ง",
);
