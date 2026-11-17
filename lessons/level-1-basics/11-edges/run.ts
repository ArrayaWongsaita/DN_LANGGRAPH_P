import { buildPipeline } from "./pipeline";

// รัน: pnpm lesson 11  (ไม่ใช้ LLM จึงไม่ต้องมี API key)
const result = await buildPipeline().invoke({});
console.log("เดินผ่าน:", result.trace);
