import { HumanMessage } from "@langchain/core/messages";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildLead } from "./subagents";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const delegate = { toolCalls: [{ name: "ask_math", args: { request: "1 บวก 2" }, id: "m1" }] };
const subScript = () => [{ toolCalls: [{ name: "add", args: { a: 1, b: 2 }, id: "a1" }] }, "ผลบวกคือ 3"];

test("agent หลักมอบงานให้ agent ย่อย แล้วตอบผู้ใช้จากคำตอบของมัน", async () => {
  const lead = fakeToolLLM([delegate, "สรุป: 3"]);
  const agent = buildLead(lead, fakeToolLLM(subScript()));
  const r = await agent.invoke({ messages: [new HumanMessage("ช่วยบวกเลข")] });
  expect(r.messages.at(-1)?.text).toBe("สรุป: 3");
});

test("agent หลักเห็นคำตอบสุดท้ายของลูกทีมเป็น ToolMessage", async () => {
  const lead = fakeToolLLM([delegate, "ok"]);
  await buildLead(lead, fakeToolLLM(subScript())).invoke({ messages: [new HumanMessage("x")] });
  const secondCall = lead.calls[1];
  expect(secondCall.some((m) => m.type === "tool" && m.text === "ผลบวกคือ 3")).toBe(true);
});

test("context แยกกัน: agent ย่อยเห็นแค่คำขอ ไม่เห็นข้อความผู้ใช้ของ agent หลัก", async () => {
  const sub = fakeToolLLM(subScript());
  await buildLead(fakeToolLLM([delegate, "ok"]), sub).invoke({ messages: [new HumanMessage("ความลับของผู้ใช้")] });
  const seen = sub.calls[0].map((m) => m.text);
  expect(seen).toEqual(["1 บวก 2"]);
});
