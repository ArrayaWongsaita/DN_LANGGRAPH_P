import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Command, MemorySaver, interrupt, isInterrupted } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { todo } from "@src/todo";
import { z } from "zod";

export function makeSendEmailTool(sent: string[]) {
  return tool(
    ({ to }: { to: string }) => {
      // 👉 ข้อ 1: ขออนุมัติก่อนทำอะไรทั้งนั้น: const ok = interrupt({ action: "sendEmail", to });
      //          ถ้า ok ไม่ใช่ true คืน "ยกเลิกแล้ว"
      const ok = todo(1);
      // 👉 ข้อ 2: ส่งจริง: sent.push(to) แล้วคืน `ส่งอีเมลถึง ${to} แล้ว`
      return todo(2);
    },
    {
      name: "sendEmail",
      description: "ส่งอีเมลถึงผู้รับที่ระบุ (ต้องได้รับอนุมัติจากมนุษย์)",
      schema: z.object({ to: z.string() }),
    },
  );
}

export function buildMailAgent(llm: BaseChatModel, sent: string[]) {
  return createAgent({
    model: llm,
    tools: [makeSendEmailTool(sent)],
    checkpointer: new MemorySaver(),
    systemPrompt: "คุณมี tool sendEmail ส่งอีเมลได้จริง เมื่อผู้ใช้ขอให้ส่งอีเมล ให้เรียก tool นั้นทันที",
  });
}

type MailAgent = ReturnType<typeof buildMailAgent>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

// ส่งคำสั่งให้ agent คืน true ถ้าหยุดรออนุมัติ
export async function request(agent: MailAgent, threadId: string, text: string): Promise<boolean> {
  return isInterrupted(await agent.invoke({ messages: [new HumanMessage(text)] }, cfg(threadId)));
}

// ตอบอนุมัติ/ปฏิเสธ แล้วคืนข้อความสุดท้ายของ agent
export async function respond(agent: MailAgent, threadId: string, approved: boolean): Promise<string> {
  const r = await agent.invoke(new Command({ resume: approved }), cfg(threadId));
  return r.messages[r.messages.length - 1].text;
}
