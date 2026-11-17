import { HumanMessage } from "@langchain/core/messages";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeAddTool } from "@src/sampleTools";
import { agentWithModelLimit, agentWithToolLimit } from "./limits";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const call = { toolCalls: [{ name: "add", args: { a: 1, b: 1 } }] };
const input = { messages: [new HumanMessage("x")] };

test("LLM ที่วนเรียก tool ไม่หยุด: ถูกตัดที่จำนวนครั้งของโมเดลที่กำหนด", async () => {
  const llm = fakeToolLLM(Array(30).fill(call));
  await agentWithModelLimit(llm, [makeAddTool()], 3).invoke(input);
  expect(llm.calls).toHaveLength(3);
});

test("เกินเพดานโมเดล: ผู้ใช้ได้ข้อความแจ้ง ไม่ใช่ exception", async () => {
  const llm = fakeToolLLM(Array(30).fill(call));
  const r = await agentWithModelLimit(llm, [makeAddTool()], 2).invoke(input);
  expect(r.messages.at(-1)?.text).toContain("limit");
});

test("ไม่เกินเพดาน: ทำงานปกติ", async () => {
  const llm = fakeToolLLM([call, "ได้ 2"]);
  const r = await agentWithModelLimit(llm, [makeAddTool()], 5).invoke(input);
  expect(r.messages.at(-1)?.text).toBe("ได้ 2");
});

test("เกินเพดาน tool: tool รันได้เท่าที่กำหนด แล้วโมเดลได้ข้อความว่าเกิน", async () => {
  const llm = fakeToolLLM([call, call, call, "จบ"]);
  const r = await agentWithToolLimit(llm, [makeAddTool()], 2).invoke(input);
  const toolTexts = r.messages.filter((m) => m.type === "tool").map((m) => m.text);
  expect(toolTexts.slice(0, 2)).toEqual(["2", "2"]);
  expect(toolTexts[2]).toContain("limit exceeded");
});
