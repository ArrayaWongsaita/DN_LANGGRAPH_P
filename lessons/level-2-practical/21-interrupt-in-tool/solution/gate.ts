import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Command, MemorySaver, interrupt, isInterrupted } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-21
// tool ที่ "มีผลจริง" (ส่งอีเมล ลบข้อมูล) ควรขออนุมัติจากคนก่อน: เรียก interrupt() ภายใน tool เลย
// ถ้าไม่อนุมัติ tool ก็ไม่ทำอะไร
const sent: string[] = []; // อีเมลที่ "ส่งจริง" (จำลอง)

const sendEmail = tool(
  ({ to }: { to: string }) => {
    // ข้อ 1: ขออนุมัติก่อนทำอะไรทั้งนั้น: const ok = interrupt({ action: "sendEmail", to });
    //        (ข้อนี้เติมแค่ตัวแปร ok การเช็กว่า ok ไม่ใช่ true เป็นของข้อ 2)
    const ok = interrupt({ action: "sendEmail", to });
    // ข้อ 2: ถ้า ok !== true คืน "ยกเลิกแล้ว" ก่อน แล้วค่อยส่งจริง: sent.push(to) แล้วคืน `ส่งอีเมลถึง ${to} แล้ว`
    if (ok !== true) return "ยกเลิกแล้ว";
    sent.push(to);
    return `ส่งอีเมลถึง ${to} แล้ว`;
  },
  {
    name: "sendEmail",
    description: "ส่งอีเมลถึงผู้รับที่ระบุ (ต้องได้รับอนุมัติจากมนุษย์)",
    schema: z.object({ to: z.string() }),
  },
);

const agent = createAgent({
  model: llm,
  tools: [sendEmail],
  checkpointer: new MemorySaver(),
  systemPrompt: "คุณมี tool sendEmail ส่งอีเมลได้จริง เมื่อผู้ใช้ขอให้ส่งอีเมล ให้เรียก tool นั้นทันที",
});

const paused: boolean[] = [];
const finals: string[] = [];
for (const [threadId, approved, to] of [["a", true, "mali@example.com"], ["b", false, "somchai@example.com"]] as const) {
  const config = { configurable: { thread_id: threadId } };
  const r1 = await agent.invoke({ messages: [new HumanMessage(`ส่งอีเมลถึง ${to} หน่อย`)] }, config);
  paused.push(isInterrupted(r1));
  // ตอบอนุมัติ/ปฏิเสธ แล้วดูข้อความสุดท้ายของ agent
  const r2 = await agent.invoke(new Command({ resume: approved }), config);
  finals.push(r2.messages[r2.messages.length - 1].text);
}
console.log({ paused, sent, finals });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("agent หยุดรออนุมัติก่อนส่ง (ทั้งสอง thread)", paused.every(Boolean), "tool ต้องเรียก interrupt() ก่อนส่ง");
check("อนุมัติแล้วส่งจริงเฉพาะรายที่อนุมัติ", sent.length === 1 && sent[0] === "mali@example.com", "ปฏิเสธแล้วต้องไม่ส่ง (sent ต้องไม่มี somchai)");
check("agent ตอบสรุปหลังจบทั้งสองรอบ", finals.every((t) => t.length > 0));
