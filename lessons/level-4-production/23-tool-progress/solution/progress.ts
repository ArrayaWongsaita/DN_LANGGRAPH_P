import { HumanMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { z } from "zod";

export function makeSlowTool() {
  const run = async function* ({ n }: { n: number }): AsyncGenerator<string, string> {
    for (let i = 1; i <= n; i++) yield `ขั้น ${i}`;
    return `เสร็จ ${n} ขั้น`;
  };
  return tool(run as never, { name: "slow", description: "งานที่ทำหลายขั้น", schema: z.object({ n: z.number() }) });
}

export function buildAgent(llm: BaseChatModel) {
  return createAgent({ model: llm, tools: [makeSlowTool()] });
}

export async function collectProgress(agent: ReturnType<typeof buildAgent>, question: string): Promise<string[]> {
  const progress: string[] = [];
  const stream = await agent.stream({ messages: [new HumanMessage(question)] }, { streamMode: ["tools"] } as never);
  for await (const chunk of stream as AsyncIterable<[string, { event: string; data?: unknown }]>) {
    const [, payload] = chunk;
    if (payload.event === "on_tool_event") progress.push(String(payload.data));
  }
  return progress;
}
