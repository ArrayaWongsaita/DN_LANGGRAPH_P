import { createInterface } from "node:readline/promises";
import { getLLM } from "../../../../src/llm";
import { buildAssistantGraph } from "./assistant";

// รันกับ LLM จริง: npm run lesson 26  (พิมพ์ exit เพื่อออก)
const graph = buildAssistantGraph(getLLM());
const rl = createInterface({ input: process.stdin, output: process.stdout });

for (;;) {
  const question = (await rl.question("\nคุณ: ")).trim();
  if (!question || question === "exit") break;
  const result = await graph.invoke({ question });
  console.log(`\n${result.answer}`);
}
rl.close();
