import { getLLM } from "@src/llm";
import { buildDraftGraph } from "./draftGraph";

// รันกับ LLM จริง: pnpm lesson 13
const result = await buildDraftGraph(getLLM()).invoke({ topic: "ประโยชน์ของการนอนหลับ" });
console.log("--- ร่าง ---\n" + result.draft);
console.log("\n--- ฉบับปรับปรุง ---\n" + result.final);
