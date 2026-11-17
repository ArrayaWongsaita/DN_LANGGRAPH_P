import { HumanMessage } from "@langchain/core/messages";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildEditingAgent } from "./editing";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const add = (id: string, n: number) => ({ toolCalls: [{ name: "add", args: { a: n, b: n }, id }] });
const toolTexts = (call: { type: string; text: string }[]) => call.filter((m) => m.type === "tool").map((m) => m.text);

async function run() {
  const llm = fakeToolLLM([add("c1", 1), add("c2", 2), add("c3", 3), "จบ"]);
  await buildEditingAgent(llm).invoke({ messages: [new HumanMessage("คำนวณ")] });
  return llm;
}

test("ผลลัพธ์ tool เก่าถูกแทนด้วย placeholder เหลือเฉพาะอันล่าสุด", async () => {
  const llm = await run();
  expect(toolTexts(llm.calls[3])).toEqual(["[ล้างแล้ว]", "[ล้างแล้ว]", "6"]);
});

test("รอบแรกยังไม่มีอะไรให้ล้าง และรอบที่สองเห็นผลลัพธ์อันแรกครบ", async () => {
  const llm = await run();
  expect(toolTexts(llm.calls[0])).toEqual([]);
  expect(toolTexts(llm.calls[1])).toEqual(["2"]);
});

test("ข้อความของผู้ใช้ไม่ถูกแตะ", async () => {
  const llm = await run();
  expect(llm.calls[3][0].text).toBe("คำนวณ");
});
