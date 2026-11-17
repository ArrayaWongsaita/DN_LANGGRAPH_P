import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { todo } from "@src/todo";
import { z } from "zod";

// agent ย่อยที่เก่งเรื่องคำนวณ
export function buildMathAgent(llm: BaseChatModel) {
  return createAgent({ model: llm, tools: [makeAddTool()] });
}

type Agent = ReturnType<typeof buildMathAgent>;

// ห่อ agent ย่อยเป็น tool: รับ { request } ส่งให้ agent ย่อย แล้วคืนข้อความสุดท้ายของมัน
export function asTool(name: string, description: string, sub: Agent) {
  // 👉 ข้อ 1: คืน tool(async ({ request }) => { const r = await sub.invoke({ messages: [new HumanMessage(request)] });
  //                     return r.messages[r.messages.length - 1].text; },
  //                   { name, description, schema: z.object({ request: z.string() }) })
  return todo(1);
}

export function buildLead(leadLlm: BaseChatModel, mathLlm: BaseChatModel) {
  const mathTool = asTool("ask_math", "ถามผู้เชี่ยวชาญด้านการคำนวณ", buildMathAgent(mathLlm));
  // 👉 ข้อ 2: คืน createAgent({ model: leadLlm, tools: [mathTool] })
  return todo(2);
}
