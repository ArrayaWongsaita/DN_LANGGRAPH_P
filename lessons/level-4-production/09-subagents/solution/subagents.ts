import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { z } from "zod";

export function buildMathAgent(llm: BaseChatModel) {
  return createAgent({ model: llm, tools: [makeAddTool()] });
}

type Agent = ReturnType<typeof buildMathAgent>;

export function asTool(name: string, description: string, sub: Agent) {
  return tool(
    async ({ request }: { request: string }) => {
      const r = await sub.invoke({ messages: [new HumanMessage(request)] });
      return r.messages[r.messages.length - 1].text;
    },
    { name, description, schema: z.object({ request: z.string() }) },
  );
}

export function buildLead(leadLlm: BaseChatModel, mathLlm: BaseChatModel) {
  const mathTool = asTool("ask_math", "ถามผู้เชี่ยวชาญด้านการคำนวณ", buildMathAgent(mathLlm));
  return createAgent({ model: leadLlm, tools: [mathTool] });
}
