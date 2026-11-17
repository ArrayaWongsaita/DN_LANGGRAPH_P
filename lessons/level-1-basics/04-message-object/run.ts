import { getLLM } from "@src/llm";

// รันกับ LLM จริง: pnpm lesson 04  ดูว่า "object คำตอบ" มีอะไรอยู่บ้าง
const reply = await getLLM().invoke("ตอบสั้น ๆ ว่า สวัสดี");

console.log("type:", reply.type);
console.log("text:", reply.text);
console.log("content:", reply.content);
console.log("usage_metadata:", reply.usage_metadata);
