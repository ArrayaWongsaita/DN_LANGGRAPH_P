import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Command, MemorySaver, isInterrupted } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware } from "langchain";
import { z } from "zod";

export function makeEmailTool(sent: string[]) {
  return tool(
    ({ to }: { to: string }) => {
      sent.push(to);
      return `ส่งถึง ${to} แล้ว`;
    },
    { name: "sendEmail", description: "ส่งอีเมล", schema: z.object({ to: z.string() }) },
  );
}

export function buildGuardedAgent(llm: BaseChatModel, sent: string[]) {
  return createAgent({
    model: llm,
    tools: [makeEmailTool(sent)],
    checkpointer: new MemorySaver(),
    middleware: [humanInTheLoopMiddleware({ interruptOn: { sendEmail: true } })],
  });
}

type Agent = ReturnType<typeof buildGuardedAgent>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

export async function request(agent: Agent, threadId: string, text: string): Promise<boolean> {
  return isInterrupted(await agent.invoke({ messages: [new HumanMessage(text)] }, cfg(threadId)));
}

export async function decide(agent: Agent, threadId: string, approve: boolean): Promise<string> {
  const decision = approve ? { type: "approve" as const } : { type: "reject" as const, message: "ไม่อนุมัติ" };
  const r = await agent.invoke(new Command({ resume: { decisions: [decision] } }), cfg(threadId));
  return r.messages[r.messages.length - 1].text;
}
