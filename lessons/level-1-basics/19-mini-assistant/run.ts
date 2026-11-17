import { createInterface } from "node:readline/promises";
import { getLLM } from "@src/llm";
import { buildAssistantGraph } from "./assistant";

// รันกับ LLM จริง: pnpm lesson 19  (พิมพ์ exit เพื่อออก)
const graph = buildAssistantGraph(getLLM({ temperature: 0 }));
const rl = createInterface({ input: process.stdin, output: process.stdout });

process.stdout.write("\nคุณ: ");
for await (const line of rl) {
  const question = line.trim();
  if (!question || question === "exit") break;
  const result = await graph.invoke({ question });
  console.log(`[${result.category}] ${result.answer}`);
  process.stdout.write("\nคุณ: ");
}
rl.close();
