import { fakeLLM } from "../../../../src/fakeLLM";
import { collectStream } from "./streamText";

test("chunk ทั้งหมดต่อกันได้คำตอบเต็ม", async () => {
  const chunks = await collectStream(fakeLLM(["สวัสดีครับ"]), "ทัก");
  expect(chunks.join("")).toBe("สวัสดีครับ");
});

test("ได้มากกว่าหนึ่ง chunk", async () => {
  const chunks = await collectStream(fakeLLM(["สวัสดีครับ"]), "ทัก");
  expect(chunks.length).toBeGreaterThan(1);
});

test("onChunk ถูกเรียกหนึ่งครั้งต่อหนึ่ง chunk", async () => {
  const onChunk = vi.fn();
  const chunks = await collectStream(fakeLLM(["abc"]), "q", onChunk);
  expect(onChunk).toHaveBeenCalledTimes(chunks.length);
});
