import { HumanMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-23
// tool ที่ทำงานนานรายงานความคืบหน้าได้: เขียน tool เป็น async generator ค่าที่ yield คือความคืบหน้า (ไปที่สตรีม) ส่วนค่าที่ return คือผลที่โมเดลเห็น
function makeSlowTool() {
  // งานที่ทำหลายขั้น
  const run = async function* ({ n }: { n: number }): AsyncGenerator<string, string> {
    // ข้อ 1: วน i จาก 1 ถึง n แล้ว yield `ขั้น ${i}` ทุกรอบ จบด้วย return `เสร็จ ${n} ขั้น`
    for (let i = 1; i <= n; i++) yield `ขั้น ${i}`;
    return `เสร็จ ${n} ขั้น`;
  };
  return tool(run as never, { name: "slow", description: "งานที่ทำหลายขั้น", schema: z.object({ n: z.number() }) });
}

function buildAgent(model: BaseChatModel) {
  return createAgent({ model, tools: [makeSlowTool()] });
}

// เก็บความคืบหน้า (ค่าที่ yield) ของ tool จากสตรีม
async function collectProgress(agent: ReturnType<typeof buildAgent>, question: string): Promise<string[]> {
  const progress: string[] = [];
  const stream = await agent.stream({ messages: [new HumanMessage(question)] }, { streamMode: ["tools"] } as never);
  for await (const chunk of stream as AsyncIterable<[string, { event: string; data?: unknown }]>) {
    const [, payload] = chunk;
    // ข้อ 2: ถ้า payload.event เป็น "on_tool_event" ให้ progress.push(String(payload.data))
    if (payload.event === "on_tool_event") progress.push(String(payload.data));
  }
  return progress;
}

// ส่วนที่ 1: โมเดลปลอมที่เรียก tool slow(3) แล้วตอบ ตรวจความคืบหน้าและสิ่งที่โมเดลเห็น
const script = (n: number) => [{ toolCalls: [{ name: "slow", args: { n }, id: "t1" }] }, "จบ"];
const progress = await collectProgress(buildAgent(fakeToolLLM(script(3))), "เริ่ม");
const noTool = await collectProgress(buildAgent(fakeToolLLM(["ทักทายเฉย ๆ"])), "สวัสดี");
const seeing = fakeToolLLM(script(2));
await buildAgent(seeing).invoke({ messages: [new HumanMessage("เริ่ม")] });
const toolMsg = seeing.calls[1].find((m) => m.type === "tool");

// ส่วนที่ 2: โมเดลจริง
const realProgress = await collectProgress(buildAgent(llm), "ใช้ tool slow ทำงาน 3 ขั้น");
console.log({ progress, realProgress });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ความคืบหน้าครบตามลำดับ", JSON.stringify(progress) === JSON.stringify(["ขั้น 1", "ขั้น 2", "ขั้น 3"]), "yield `ขั้น ${i}` ในลูป และเก็บ on_tool_event");
check("ไม่เรียก tool: ไม่มีความคืบหน้า", noTool.length === 0);
check("โมเดลเห็นเฉพาะค่าที่ return ไม่เห็นค่าที่ yield", toolMsg?.text === "เสร็จ 2 ขั้น");
check("โมเดลจริง: ได้ความคืบหน้าเรียงตั้งแต่ขั้น 1", realProgress.length >= 1 && realProgress[0] === "ขั้น 1");
