import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeAddTool } from "@src/sampleTools";
import { buildAssistant, chat } from "./create";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("agent ใช้ tool แล้วตอบสรุป", async () => {
  const llm = fakeToolLLM([{ toolCalls: [{ name: "add", args: { a: 2, b: 3 } }] }, "ได้ 5"]);
  expect(await chat(buildAssistant(llm, [makeAddTool()]), "t", "2+3")).toBe("ได้ 5");
});

test("LLM เห็น systemPrompt เป็นข้อความแรก", async () => {
  const llm = fakeToolLLM(["ตอบ"]);
  await chat(buildAssistant(llm, [makeAddTool()]), "t", "ทัก");
  expect(llm.calls[0][0].type).toBe("system");
  expect(llm.calls[0][0].text).toBe("คุณคือผู้ช่วยที่ตอบสั้น กระชับ");
});

test("agent จำข้ามรอบใน thread เดียวกัน และแยก thread อื่น", async () => {
  const llm = fakeToolLLM(["หนึ่ง", "สอง", "สาม"]);
  const agent = buildAssistant(llm, [makeAddTool()]);
  await chat(agent, "a", "ฉันชื่อมาลี");
  await chat(agent, "a", "ฉันชื่ออะไร");
  expect(llm.calls[1].map((m) => m.text)).toContain("ฉันชื่อมาลี");
  await chat(agent, "b", "คนอื่น");
  expect(llm.calls[2].map((m) => m.text)).not.toContain("ฉันชื่อมาลี");
});

test("ผูก tool ที่ให้ไว้", async () => {
  const llm = fakeToolLLM(["x"]);
  await chat(buildAssistant(llm, [makeAddTool()]), "t", "x");
  expect(llm.boundToolNames).toEqual(["add"]);
});
