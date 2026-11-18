import { tool } from "@langchain/core/tools";
import type { ProtocolEvent } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { z } from "zod";
import { fakeToolLLM } from "./fakeToolLLM";

// เอเจนต์ตัวอย่างสำหรับบทเรื่อง event streaming: โมเดลปลอมเรียก tool "add" หนึ่งครั้งแล้วตอบ
// รันของจริง (เอเจนต์จริง + streamEvents จริง) แต่ไม่ต้องใช้เครือข่ายหรือ key
export function buildDemoAgent() {
  const add = tool(async ({ a, b }) => String(a + b), {
    name: "add",
    description: "บวกเลขสองจำนวน",
    schema: z.object({ a: z.number(), b: z.number() }),
  });
  const llm = fakeToolLLM([{ toolCalls: [{ name: "add", args: { a: 1, b: 2 } }] }, "ผลคือ 3"]);
  return createAgent({ model: llm, tools: [add] });
}

export async function demoRun() {
  return buildDemoAgent().streamEvents({ messages: [{ role: "user", content: "1+2 เท่าไร" }] }, { version: "v3" });
}

export async function recordDemoEvents(): Promise<ProtocolEvent[]> {
  const events: ProtocolEvent[] = [];
  for await (const ev of await demoRun()) events.push(ev);
  return events;
}
