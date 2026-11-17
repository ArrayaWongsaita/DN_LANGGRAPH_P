import { fakeToolLLM } from "@src/fakeToolLLM";
import { makeAddTool } from "@src/sampleTools";
import { buildAgent, runAgent } from "./agent";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const tools = [makeAddTool()];
const callAdd = (a: number, b: number) => ({ toolCalls: [{ name: "add", args: { a, b } }] });

test("ไม่ต้องใช้ tool: LLM ตอบตรง ๆ แล้วจบ", async () => {
  const messages = await runAgent(buildAgent(fakeToolLLM(["สวัสดี"]), tools), "ทัก");
  expect(messages.map((m) => m.type)).toEqual(["human", "ai"]);
});

test("ใช้ tool หนึ่งรอบ: agent → tools → agent", async () => {
  const llm = fakeToolLLM([callAdd(2, 3), "ได้ 5"]);
  const messages = await runAgent(buildAgent(llm, tools), "2+3");
  expect(messages.map((m) => m.type)).toEqual(["human", "ai", "tool", "ai"]);
  expect(messages[2].text).toBe("5");
  expect(messages[3].text).toBe("ได้ 5");
});

test("LLM เห็นผลของ tool ในการเรียกรอบสอง", async () => {
  const llm = fakeToolLLM([callAdd(2, 3), "ได้ 5"]);
  await runAgent(buildAgent(llm, tools), "2+3");
  expect(llm.calls[1].map((m) => m.type)).toEqual(["human", "ai", "tool"]);
});

test("ใช้ tool หลายรอบต่อเนื่องได้ (วนจนพอใจ)", async () => {
  const llm = fakeToolLLM([callAdd(1, 2), callAdd(3, 4), "สรุป"]);
  const messages = await runAgent(buildAgent(llm, tools), "ช่วยบวกสองรอบ");
  expect(messages.filter((m) => m.type === "tool").map((m) => m.text)).toEqual(["3", "7"]);
  expect(messages[messages.length - 1].text).toBe("สรุป");
});

test("agent ผูก tool ให้ LLM", async () => {
  const llm = fakeToolLLM(["x"]);
  await runAgent(buildAgent(llm, tools), "x");
  expect(llm.boundToolNames).toEqual(["add"]);
});
