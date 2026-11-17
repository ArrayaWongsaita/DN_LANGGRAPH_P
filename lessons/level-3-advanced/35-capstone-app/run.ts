import { createInterface } from "node:readline/promises";
import { InMemoryStore } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { getLLM } from "@src/llm";
import { buildApp, decide, start } from "./app";

// รันกับ LLM จริง: pnpm lesson 3-35  (ความจำของงานอยู่ที่ capstone-memory.db)
const store = new InMemoryStore();
await store.put(["prefs", "me"], "lang", { lang: "th" });
const app = buildApp(getLLM({ temperature: 0 }), SqliteSaver.fromConnString("capstone-memory.db"), store);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const lines = rl[Symbol.asyncIterator]();
const ask = async (prompt: string): Promise<string> => {
  process.stdout.write(prompt);
  return ((await lines.next()).value ?? "").trim();
};
const question = (await ask("หัวข้อรายงาน: ")) || "ประโยชน์ของการนอนหลับ";
const threadId = `run-${Date.now()}`;

const r = await start(app, threadId, "me", question);
console.log(`ความคืบหน้า: ${r.stages.join(" → ")}`);
console.log(`\n--- รายงานที่รออนุมัติ ---\n${r.report}\n`);
const answer = (await ask("เผยแพร่ไหม (y/n): ")).toLowerCase();
console.log(await decide(app, threadId, "me", answer === "y"));
rl.close();
