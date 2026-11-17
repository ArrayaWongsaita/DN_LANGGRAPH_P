import { fakeLLM } from "../../../../src/fakeLLM";
import { askOnce } from "./askOnce";

test("askOnce คืนคำตอบของ LLM", async () => {
  expect(await askOnce(fakeLLM(["สวัสดี"]), "ทักหน่อย")).toBe("สวัสดี");
});

test("คำตอบเป็น string", async () => {
  expect(typeof (await askOnce(fakeLLM(["x"]), "q"))).toBe("string");
});

test("เรียกครั้งที่สองได้คำตอบอันที่สอง", async () => {
  const llm = fakeLLM(["หนึ่ง", "สอง"]);
  await askOnce(llm, "q");
  expect(await askOnce(llm, "q")).toBe("สอง");
});
