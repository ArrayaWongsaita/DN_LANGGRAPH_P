import { describeProvider } from "@src/llm";
import { maskKey, readKey } from "./readKey";

// รัน: pnpm lesson 02  (ไม่เรียก LLM แค่ตรวจว่าตั้งค่าครบ)
// describeProvider() โหลดไฟล์ .env ให้ แล้วบอกว่าตอนนี้ใช้ provider/โมเดล/ตัวแปร key ไหน
const { provider, model, keyVar } = describeProvider();
console.log(`provider: ${provider}`);
console.log(`model:    ${model}`);

const key = readKey(process.env, keyVar);
if (key) {
  console.log(`${keyVar}: พบแล้ว (${maskKey(key)})`);
} else {
  console.log(`${keyVar}: ยังไม่ได้ตั้ง  -> เปิดไฟล์ .env แล้วใส่ key (ดูตัวอย่างใน .env.example)`);
}
