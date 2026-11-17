import { createInterface } from "node:readline/promises";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { getLLM } from "@src/llm";
import { buildNoteAssistant, say } from "./notes";

// รันกับ LLM จริง: pnpm lesson 2-17  (พิมพ์ exit เพื่อออก; ความจำอยู่ที่ notes-memory.db)
const agent = buildNoteAssistant(getLLM({ temperature: 0 }), [], SqliteSaver.fromConnString("notes-memory.db"));
const rl = createInterface({ input: process.stdin, output: process.stdout });

for (;;) {
  const text = (await rl.question("\nคุณ: ")).trim();
  if (!text || text === "exit") break;
  console.log(await say(agent, text));
}
rl.close();
