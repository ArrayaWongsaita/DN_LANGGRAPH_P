import { getLLM } from "@src/llm";
import { buildRefineLoop } from "./refineLoop";

// รันกับ LLM จริง: pnpm lesson 15  (ไม่เกิน 3 รอบ) เริ่มจากข้อความ "แมวกินปลา" แล้วให้ LLM ปรับปรุงทีละรอบ
const result = await buildRefineLoop(getLLM(), 3).invoke({});
console.log(`ทำไป ${result.rounds} รอบ ตอบสุดท้าย:`, result.last);
