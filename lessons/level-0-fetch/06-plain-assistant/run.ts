import { createInterface } from "node:readline/promises";
import { describeProvider } from "@src/llm";
import { type Ask, runAssistant } from "./assistant";

// รันกับ LLM จริง: pnpm lesson 0-06  (พิมพ์ exit เพื่อออก)
// สร้าง ask จาก fetch (หน้าตาเหมือนบท 0-01 ย่อให้เหลือเท่าที่ใช้)
const { model, chatUrl, apiKey } = describeProvider();

const ask: Ask = async (prompt) => {
  const res = await fetch(chatUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0].message.content;
};

const rl = createInterface({ input: process.stdin, output: process.stdout });
for (;;) {
  const question = (await rl.question("\nคุณ: ")).trim();
  if (!question || question === "exit") break;
  const result = await runAssistant(ask, question);
  console.log(`[${result.category}, ปรับปรุง ${result.rounds} รอบ] ${result.answer}`);
}
rl.close();
