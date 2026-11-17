import { checkKey, checkSettings, maskKey } from "./envCheck";

// รัน: pnpm lesson 02  (ไม่เรียก LLM แค่ตรวจว่าตั้งค่าครบ)
// โหลดไฟล์ .env เข้า process.env (ถ้าไม่มีไฟล์ก็ข้ามไป)
try {
  process.loadEnvFile();
} catch {
  console.log("ไม่พบไฟล์ .env  -> ทำตามขั้น 'ตั้งค่าก่อนเริ่ม' ใน README");
}

const settings = checkSettings(process.env);
if (!settings.ok) {
  console.log("ค่าตั้งต้นใน .env ไม่ถูกต้อง:");
  for (const p of settings.problems) console.log(`  - ${p}`);
  process.exit(1);
}

const { LLM_PROVIDER, LLM_MODEL } = settings.value;
console.log(`provider: ${LLM_PROVIDER}`);
console.log(`model:    ${LLM_MODEL || "(ใช้ค่าเริ่มต้นของ provider)"}`);

const keyVar = LLM_PROVIDER === "groq" ? "GROQ_API_KEY" : "OLLAMA_API_KEY";
const key = checkKey(process.env, keyVar);
console.log(key.ok ? `${keyVar}: พบแล้ว (${maskKey(key.key)})` : key.problem);
