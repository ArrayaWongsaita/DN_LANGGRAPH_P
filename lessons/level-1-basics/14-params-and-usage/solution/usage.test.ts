import { AIMessage } from "@langchain/core/messages";
import { getTokenUsage } from "./usage";

test("อ่านจำนวน token จาก usage_metadata", () => {
  const msg = new AIMessage({
    content: "x",
    usage_metadata: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
  });
  expect(getTokenUsage(msg)).toEqual({ input: 10, output: 5, total: 15 });
});

test("ไม่มี usage_metadata ได้ 0 ทั้งหมด", () => {
  expect(getTokenUsage(new AIMessage("x"))).toEqual({ input: 0, output: 0, total: 0 });
});

test("total คือ input + output", () => {
  const msg = new AIMessage({
    content: "x",
    usage_metadata: { input_tokens: 3, output_tokens: 4, total_tokens: 999 },
  });
  expect(getTokenUsage(msg).total).toBe(7);
});
