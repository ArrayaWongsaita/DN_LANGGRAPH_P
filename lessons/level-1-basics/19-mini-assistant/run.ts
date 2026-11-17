import { createInterface } from "node:readline/promises";
import { getLLM } from "@src/llm";
import { buildAssistantGraph } from "./assistant";

// รันกับ LLM จริง: pnpm lesson 19  (พิมพ์ exit เพื่อออก)
const graph = buildAssistantGraph(getLLM({ temperature: 0 }));
const rl = createInterface({ input: process.stdin, output: process.stdout });

for (;;) {
  const question = (await rl.question("\nคุณ: ")).trim();
  if (!question || question === "exit") break;
  const result = await graph.invoke({ question });
  console.log(`[${result.category}] ${result.answer}`);
}
rl.close();
