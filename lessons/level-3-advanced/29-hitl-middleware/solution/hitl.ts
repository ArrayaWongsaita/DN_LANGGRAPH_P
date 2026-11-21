import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Command, MemorySaver, isInterrupted } from "@langchain/langgraph";
import { createAgent, humanInTheLoopMiddleware } from "langchain";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-29
// แทนที่จะเรียก interrupt() ใน tool เอง (บท 2-21) ใช้ humanInTheLoopMiddleware: บอกว่า tool ไหนต้องขออนุมัติ
const sent: string[] = [];
const sendEmail = tool(
  ({ to }: { to: string }) => {
    sent.push(to);
    return `ส่งถึง ${to} แล้ว`;
  },
  { name: "sendEmail", description: "ส่งอีเมล", schema: z.object({ to: z.string() }) },
);

const agent = createAgent({
  model: llm,
  tools: [sendEmail],
  checkpointer: new MemorySaver(),
  middleware: [humanInTheLoopMiddleware({ interruptOn: { sendEmail: true } })],
});

const paused: boolean[] = [];
const finals: string[] = [];
for (const [threadId, approve, to] of [["a", true, "mali@example.com"], ["b", false, "somchai@example.com"]] as const) {
  const config = { configurable: { thread_id: threadId } };
  const r1 = await agent.invoke({ messages: [new HumanMessage(`ส่งอีเมลถึง ${to} หน่อย ใช้ tool sendEmail ได้เลย`)] }, config);
  paused.push(isInterrupted(r1));
  const decision = approve ? { type: "approve" as const } : { type: "reject" as const, message: "ไม่อนุมัติ" };
  const r2 = await agent.invoke(new Command({ resume: { decisions: [decision] } }), config);
  finals.push(r2.messages[r2.messages.length - 1].text);
}
console.log({ paused, sent, finals });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("agent หยุดรออนุมัติก่อนส่ง (ทั้งสอง thread)", paused.every(Boolean), "ต้องใส่ humanInTheLoopMiddleware ให้ sendEmail");
check("อนุมัติแล้วส่งจริงเฉพาะรายที่อนุมัติ", sent.length === 1 && sent[0] === "mali@example.com", "reject ต้องไม่รัน tool");
check("agent ตอบสรุปหลังจบทั้งสองรอบ", finals.every((t) => t.length > 0));
