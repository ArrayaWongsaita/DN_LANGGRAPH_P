// รันด้วย pnpm lesson 2-21
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Command, MemorySaver, interrupt, isInterrupted } from "@langchain/langgraph";
import { createAgent } from "langchain";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { check } from "@src/check";

const sent: string[] = [];

const sendEmail = tool(
  ({ to }) => {
    console.log(`เข้า sendEmail(${to})`);
    const approved: unknown = interrupt({ action: "sendEmail", to });
    if (approved !== true) return "ยกเลิกแล้ว";
    sent.push(to); // จำลองการส่งอีเมล
    return `ส่งอีเมลถึง ${to} แล้ว`;
  },
  {
    name: "sendEmail",
    description: "ส่งอีเมลถึงผู้รับที่ระบุหลังได้รับอนุมัติ",
    schema: z.object({ to: z.string().email() }),
  },
);

const model = fakeToolLLM([
  { toolCalls: [{ name: "sendEmail", args: { to: "mali@example.com" } }] },
  "ประมวลผลคำขอแล้ว",
  { toolCalls: [{ name: "sendEmail", args: { to: "somchai@example.com" } }] },
  "ประมวลผลคำขอแล้ว",
]);

const agent = createAgent({ model, tools: [sendEmail], checkpointer: new MemorySaver() });
const paused: boolean[] = [];
const toolResults: string[] = [];

for (const [to, answer] of [["mali@example.com", true], ["somchai@example.com", false]] as const) {
  const config = { configurable: { thread_id: to } };
  const started = await agent.invoke({ messages: [new HumanMessage(`ส่งอีเมลถึง ${to}`)] }, config);
  const request = isInterrupted(started) ? started.__interrupt__[0]?.value : undefined;
  console.log(JSON.stringify({ request, sent }));
  paused.push(request !== undefined && !sent.includes(to));

  const finished = await agent.invoke(new Command({ resume: answer }), config);
  const result = finished.messages.find((message) => message.type === "tool")?.text ?? "";
  console.log(JSON.stringify({ answer, result, sent }));
  toolResults.push(result);
}

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("ทั้งสอง thread หยุดก่อนส่ง", paused.every(Boolean));
check("อนุมัติแล้วส่งถึงมาลี", toolResults[0] === "ส่งอีเมลถึง mali@example.com แล้ว" && sent[0] === "mali@example.com");
check("ปฏิเสธแล้วข้ามการส่งถึงสมชาย", toolResults[1] === "ยกเลิกแล้ว" && sent.length === 1);
