import { HumanMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { todo } from "@src/todo";
import { z } from "zod";

export function makeSlowTool() {
  // 👉 ข้อ 1: ฟังก์ชัน async generator: วน i จาก 1 ถึง n แล้ว yield `ขั้น ${i}` ทุกรอบ จบด้วย return `เสร็จ ${n} ขั้น`
  const run = async function* ({ n }: { n: number }): AsyncGenerator<string, string> {
    return todo(1);
  };
  return tool(run as never, { name: "slow", description: "งานที่ทำหลายขั้น", schema: z.object({ n: z.number() }) });
}

export function buildAgent(llm: BaseChatModel) {
  return createAgent({ model: llm, tools: [makeSlowTool()] });
}

// เก็บความคืบหน้า (ค่าที่ yield) ของ tool จากสตรีม
export async function collectProgress(agent: ReturnType<typeof buildAgent>, question: string): Promise<string[]> {
  const progress: string[] = [];
  const stream = await agent.stream({ messages: [new HumanMessage(question)] }, { streamMode: ["tools"] } as never);
  for await (const chunk of stream as AsyncIterable<[string, { event: string; data?: unknown }]>) {
    const [, payload] = chunk;
    // 👉 ข้อ 2: ถ้า payload.event เป็น "on_tool_event" ให้ push String(payload.data) ลง progress
    todo(2);
  }
  return progress;
}
