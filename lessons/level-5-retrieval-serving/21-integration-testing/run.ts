import { getLLM } from "@src/llm";
import { classifyError, createBudget, eventually, liveStatus, mentions } from "./live";

// ตัวอย่าง integration test แบบรันมือ: เปิดด้วย RUN_LIVE=1 (อ่าน key จาก .env ที่ src/llm จัดการ)
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
const status = liveStatus(process.env);
console.log("สถานะ:", status.reason);
if (!status.enabled) process.exit(0);

const budget = createBudget(6);
const llm = getLLM({ temperature: 0 });
try {
  const text = await eventually(
    async () => {
      budget.spend();
      const reply = (await llm.invoke("2 บวก 3 เท่ากับเท่าไร ตอบสั้น ๆ")).text;
      if (!mentions(reply, ["5", "ห้า", "five"])) throw new Error(`ไม่พบคำตอบ 5 ในข้อความ: ${reply.slice(0, 40)}`);
      return reply;
    },
    { attempts: 3, delayMs: 500 },
  );
  console.log("ผ่าน:", text.slice(0, 80), `(ใช้การเรียก ${budget.used} ครั้ง)`);
} catch (error) {
  console.log("ไม่ผ่าน:", classifyError(error), (error as Error).message);
}
