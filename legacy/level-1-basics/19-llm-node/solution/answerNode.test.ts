import { fakeLLM } from "../../../../src/fakeLLM";
import { buildAnswerGraph, makeAnswerNode } from "./answerNode";

test("answer เท่ากับคำตอบของ LLM", async () => {
  const result = await buildAnswerGraph(fakeLLM(["คำตอบ"])).invoke({ question: "ถาม" });
  expect(result.answer).toBe("คำตอบ");
});

test("question ไม่ถูกเปลี่ยน", async () => {
  const result = await buildAnswerGraph(fakeLLM(["คำตอบ"])).invoke({ question: "ถาม" });
  expect(result.question).toBe("ถาม");
});

test("node ที่ได้จาก makeAnswerNode คืนเฉพาะ answer", async () => {
  const node = makeAnswerNode(fakeLLM(["x"]));
  expect(await node({ question: "q", answer: "" })).toEqual({ answer: "x" });
});
