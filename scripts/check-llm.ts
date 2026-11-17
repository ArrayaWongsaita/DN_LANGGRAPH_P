import { getLLM } from "../src/llm";

// รันเอง: OLLAMA_API_KEY=... npx tsx scripts/check-llm.ts
const llm = getLLM();
const reply = await llm.invoke("ตอบว่า OK คำเดียว");
console.log("reply:", reply.content);
console.log("usage:", reply.usage_metadata);
