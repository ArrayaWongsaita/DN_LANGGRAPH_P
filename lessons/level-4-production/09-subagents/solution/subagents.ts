import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-09
// subagent: agent หลัก "มอบงาน" ให้ agent ย่อยผ่าน tool agent ย่อยมี context ของตัวเอง เห็นแค่คำขอที่ถูกส่งให้
// agent ย่อยที่เก่งเรื่องคำนวณ
function buildMathAgent(model: BaseChatModel) {
  return createAgent({ model, tools: [makeAddTool()] });
}

type Agent = ReturnType<typeof buildMathAgent>;

// ห่อ agent ย่อยเป็น tool: รับ { request } ส่งให้ agent ย่อย แล้วคืนข้อความสุดท้ายของมัน
function asTool(name: string, description: string, sub: Agent) {
  // ข้อ 1: คืน tool(async ({ request }) => { const r = await sub.invoke({ messages: [new HumanMessage(request)] });
  //                     return r.messages[r.messages.length - 1].text; },
  //                   { name, description, schema: z.object({ request: z.string() }) })
  return tool(
    async ({ request }: { request: string }) => {
      const r = await sub.invoke({ messages: [new HumanMessage(request)] });
      return r.messages[r.messages.length - 1].text;
    },
    { name, description, schema: z.object({ request: z.string() }) },
  );
}

function buildLead(leadModel: BaseChatModel, mathModel: BaseChatModel) {
  const mathTool = asTool("ask_math", "ถามผู้เชี่ยวชาญด้านการคำนวณ", buildMathAgent(mathModel));
  // ข้อ 2: คืน createAgent({ model: leadModel, tools: [mathTool] })
  return createAgent({ model: leadModel, tools: [mathTool] });
}

// ส่วนที่ 1: โมเดลปลอมสองตัว (หัวหน้ากับลูกทีม) ตอบตามสคริปต์ เพื่อดูว่าข้อมูลไหลอย่างไร
const delegate = { toolCalls: [{ name: "ask_math", args: { request: "1 บวก 2" }, id: "m1" }] };
const leadFake = fakeToolLLM([delegate, "สรุป: 3"]);
const subFake = fakeToolLLM([{ toolCalls: [{ name: "add", args: { a: 1, b: 2 }, id: "a1" }] }, "ผลบวกคือ 3"]);
const r = await buildLead(leadFake, subFake).invoke({ messages: [new HumanMessage("ความลับของผู้ใช้ ช่วยบวกเลข")] });
const leadSecondCall = leadFake.calls[1] ?? [];
const subSaw = (subFake.calls[0] ?? []).map((m) => m.text);

// ส่วนที่ 2: โมเดลจริงทั้งสองตัว
const real = await buildLead(llm, llm).invoke({ messages: [new HumanMessage("ใช้ผู้เชี่ยวชาญด้านการคำนวณ (ask_math) หาผลบวกของ 1 กับ 2 แล้วบอกผล")] });
console.log("โมเดลจริงตอบ:", real.messages.at(-1)?.text);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("agent หลักมอบงานให้ agent ย่อย แล้วตอบผู้ใช้จากคำตอบของมัน", r.messages.at(-1)?.text === "สรุป: 3", "ต่อ asTool(...) เข้า tools ของ agent หลัก");
check("agent หลักเห็นคำตอบสุดท้ายของลูกทีมเป็น ToolMessage", leadSecondCall.some((m) => m.type === "tool" && m.text === "ผลบวกคือ 3"), "tool ต้องคืนข้อความสุดท้ายของ sub");
check("context แยกกัน: agent ย่อยเห็นแค่คำขอ ไม่เห็นข้อความของผู้ใช้", JSON.stringify(subSaw) === JSON.stringify(["1 บวก 2"]), "ส่งเฉพาะ request เข้า sub.invoke");
check("ใช้โมเดลจริงแล้วตอบผลบวก 3", (real.messages.at(-1)?.text ?? "").includes("3"));
