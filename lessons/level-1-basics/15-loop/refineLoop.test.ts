import { END } from "@langchain/langgraph";
import { fakeLLM } from "@src/fakeLLM";
import { buildRefineLoop, shouldContinue } from "./refineLoop";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("shouldContinue: LLM ตอบ OK แล้ว ให้หยุด (END)", () => {
  expect(shouldContinue({ last: "OK", rounds: 1 }, 5)).toBe(END);
});

test("shouldContinue: ยังไม่ OK และยังไม่ครบรอบ ให้วนกลับ refine", () => {
  expect(shouldContinue({ last: "ยังไม่ดี", rounds: 1 }, 5)).toBe("refine");
});

test("shouldContinue: ครบรอบสูงสุดแล้ว ให้หยุดแม้ยังไม่ OK", () => {
  expect(shouldContinue({ last: "ยังไม่ดี", rounds: 3 }, 3)).toBe(END);
});

test("graph วนจนได้ OK", async () => {
  const graph = buildRefineLoop(fakeLLM(["ยังไม่ดี", "ยังไม่ดี", "OK"]), 10);
  const result = await graph.invoke({});
  expect(result.rounds).toBe(3);
  expect(result.last).toBe("OK");
});

test("graph หยุดเมื่อครบรอบสูงสุด แม้ LLM ไม่เคยตอบ OK", async () => {
  const graph = buildRefineLoop(fakeLLM(["ไม่ดี"]), 2);
  const result = await graph.invoke({});
  expect(result.rounds).toBe(2);
});

test("ตอบ OK ตั้งแต่รอบแรกก็ทำแค่รอบเดียว", async () => {
  const result = await buildRefineLoop(fakeLLM(["OK"]), 5).invoke({});
  expect(result.rounds).toBe(1);
});
