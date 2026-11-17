import { getLLM } from "../../../src/llm";
import { getTokenUsage } from "./usage";

// รันกับ LLM จริง: npm run lesson 14
// temperature ต่ำ = ตอบนิ่ง/ซ้ำได้, สูง = หลากหลาย
for (const temperature of [0, 1]) {
  const res = await getLLM({ temperature }).invoke("ตั้งชื่อร้านกาแฟ 1 ชื่อ");
  console.log(`temperature=${temperature}:`, res.content, getTokenUsage(res));
}
