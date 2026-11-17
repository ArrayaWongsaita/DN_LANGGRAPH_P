import { readKey } from "./readKey";

try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ลองอ่านจาก environment ตรง ๆ
}

const key = readKey(process.env);
console.log(`พบ key แล้ว: ${key.slice(0, 4)}…(ซ่อนส่วนที่เหลือ)`);
