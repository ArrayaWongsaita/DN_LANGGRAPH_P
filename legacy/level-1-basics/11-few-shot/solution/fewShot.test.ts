import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { buildFewShot } from "./fewShot";

const examples = [
  { input: "ดี", output: "positive" },
  { input: "แย่", output: "negative" },
];

test("จำนวนข้อความ = 2 x ตัวอย่าง + 1", () => {
  expect(buildFewShot(examples, "โอเค")).toHaveLength(5);
});

test("สลับ human / ai ตามตัวอย่าง", () => {
  const msgs = buildFewShot(examples, "โอเค");
  expect(msgs[0]).toBeInstanceOf(HumanMessage);
  expect(msgs[1]).toBeInstanceOf(AIMessage);
  expect(msgs[1].content).toBe("positive");
});

test("ข้อความสุดท้ายคือ input ใหม่", () => {
  const msgs = buildFewShot(examples, "โอเค");
  const last = msgs[msgs.length - 1];
  expect(last).toBeInstanceOf(HumanMessage);
  expect(last.content).toBe("โอเค");
});
