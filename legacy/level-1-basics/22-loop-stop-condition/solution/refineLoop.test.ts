import { fakeLLM } from "../../../../src/fakeLLM";
import { buildRefineLoop } from "./refineLoop";

test("หยุดเมื่อ LLM ตอบ OK", async () => {
  const result = await buildRefineLoop(fakeLLM(["แก้อีก", "OK"]), 5).invoke({});
  expect(result.rounds).toBe(2);
  expect(result.last).toBe("OK");
});

test("หยุดเมื่อครบ maxRounds แม้ยังไม่ OK", async () => {
  const result = await buildRefineLoop(fakeLLM(["ยังไม่ดี"]), 3).invoke({});
  expect(result.rounds).toBe(3);
});

test("rounds นับจำนวนรอบที่ทำจริง", async () => {
  const result = await buildRefineLoop(fakeLLM(["OK"]), 5).invoke({});
  expect(result.rounds).toBe(1);
});
