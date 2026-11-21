import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent, fakeModel } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-07
// ทดสอบ agent โดยไม่เรียกโมเดลจริง: ใช้ fakeModel() ทางการของ langchain กำหนดว่าโมเดล "จะตอบอะไรตามลำดับ" (ขอเรียก tool แล้วตอบสุดท้าย หรือล้มเหลว)
function buildCalculator(model: BaseChatModel) {
  return createAgent({ model, tools: [makeAddTool()] });
}

// ถามเครื่องคิดเลข: ถ้าโมเดลล้ม ให้ตอบ "ขออภัย ระบบขัดข้อง" แทนที่จะโยน error
async function ask(agent: ReturnType<typeof buildCalculator>, question: string): Promise<string> {
  try {
    const result = await agent.invoke({ messages: [new HumanMessage(question)] });
    return result.messages[result.messages.length - 1].text;
  } catch {
    return "ขออภัย ระบบขัดข้อง";
  }
}

// สคริปต์ของโมเดลปลอม: รอบแรกขอเรียก tool add(2,3) รอบสองตอบสุดท้าย
const model = fakeModel()
  .respondWithTools([{ name: "add", args: { a: 2, b: 3 }, id: "c1" }])
  .respond(new AIMessage("ผลคือ 5"));
const answer = await ask(buildCalculator(model), "2+3 เท่าไร");
const second = model.calls[1]?.messages ?? [];

// โมเดลปลอมที่ล้มเหลว (เช่น rate limit)
const failing = fakeModel().respond(new Error("rate limit"));
const apology = await ask(buildCalculator(failing), "x");

// agent เดียวกันกับโมเดลจริง
const real = await ask(buildCalculator(llm), "ใช้ tool add บวก 2 กับ 3 แล้วบอกผล");
console.log({ answer, apology, real });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("โมเดลขอเรียก tool แล้วตอบสุดท้าย: agent ทำครบและได้คำตอบ", answer === "ผลคือ 5" && model.callCount === 2, "คืน createAgent({ model, tools })");
check("รอบที่สองโมเดลเห็นผลลัพธ์ของ tool (5) ในประวัติ", second.some((m: { type: string; text: string }) => m.type === "tool" && m.text === "5"));
check("โมเดลล้ม: ได้ข้อความสุภาพ ไม่ใช่ exception", apology === "ขออภัย ระบบขัดข้อง", "ใน catch คืนข้อความขออภัย");
check("agent เดียวกันกับโมเดลจริงได้คำตอบที่มี 5", real.includes("5") || real.includes("๕"));
