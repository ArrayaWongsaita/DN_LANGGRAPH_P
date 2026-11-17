import { describeProvider } from "@src/llm";
import { callLLM } from "./callLLM";

// รันกับ LLM จริง: pnpm lesson 0-01
// describeProvider() โหลดไฟล์ .env ให้ แล้วบอก URL / โมเดล / ชื่อตัวแปร key ที่ใช้อยู่
const { model, keyVar, chatUrl } = describeProvider();
const apiKey = (process.env[keyVar] ?? "").trim();

if (!apiKey) {
  console.error(`ยังไม่ได้ตั้ง ${keyVar} ในไฟล์ .env  -> คัดลอก .env.example เป็น .env แล้วใส่ key ของคุณ (ดูขั้น "ตั้งค่าก่อนเริ่ม" ใน README)`);
  process.exit(1);
}

const answer = await callLLM({
  fetchFn: fetch, // fetch ของจริงที่มากับ Node
  url: chatUrl,
  apiKey,
  model,
  question: "ทักทายคนที่เพิ่งเริ่มเรียนเขียนแอป LLM หนึ่งประโยค",
});
console.log(answer);
