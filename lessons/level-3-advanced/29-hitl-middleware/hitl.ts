import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Command, MemorySaver, isInterrupted } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware } from "langchain";
import { todo } from "@src/todo";
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
    // 👉 ข้อ 1: ใส่ middleware: [humanInTheLoopMiddleware({ interruptOn: { sendEmail: true } })]
    middleware: todo(1),
  });
}

type Agent = ReturnType<typeof buildGuardedAgent>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

export async function request(agent: Agent, threadId: string, text: string): Promise<boolean> {
  return isInterrupted(await agent.invoke({ messages: [new HumanMessage(text)] }, cfg(threadId)));
}

export async function decide(agent: Agent, threadId: string, approve: boolean): Promise<string> {
  // 👉 ข้อ 2: resume ด้วย new Command({ resume: { decisions: [คำตัดสินหนึ่งรายการ] } })
  //          approve เป็นจริง = { type: "approve" } ไม่เช่นนั้น { type: "reject", message: "ไม่อนุมัติ" }
  //          แล้วคืนข้อความสุดท้ายของ agent (.messages.at(-1).text)
  return todo(2);
}
