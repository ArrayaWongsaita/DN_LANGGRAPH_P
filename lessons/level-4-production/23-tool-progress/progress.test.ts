import { HumanMessage } from "@langchain/core/messages";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildAgent, collectProgress } from "./progress";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const script = (n: number) => [{ toolCalls: [{ name: "slow", args: { n }, id: "t1" }] }, "จบ"];

test("ได้ความคืบหน้าครบตามลำดับ", async () => {
  const progress = await collectProgress(buildAgent(fakeToolLLM(script(3))), "เริ่ม");
  expect(progress).toEqual(["ขั้น 1", "ขั้น 2", "ขั้น 3"]);
});

test("ไม่เรียก tool: ไม่มีความคืบหน้า", async () => {
  expect(await collectProgress(buildAgent(fakeToolLLM(["ทักทายเฉย ๆ"])), "สวัสดี")).toEqual([]);
});

test("โมเดลเห็นเฉพาะค่าที่ return ไม่เห็นค่าที่ yield", async () => {
  const llm = fakeToolLLM(script(2));
  await buildAgent(llm).invoke({ messages: [new HumanMessage("เริ่ม")] });
  const toolMsg = llm.calls[1].find((m) => m.type === "tool");
  expect(toolMsg?.text).toBe("เสร็จ 2 ขั้น");
});
