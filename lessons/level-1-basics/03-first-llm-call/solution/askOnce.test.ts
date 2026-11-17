import { AIMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
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

test("content เป็น array ของ block ก็ได้ข้อความ (ไม่ใช่ [object Object])", async () => {
  const blockLLM = {
    invoke: async () => new AIMessage({ content: [{ type: "text", text: "hi" }] }),
  } as unknown as BaseChatModel;
  expect(await askOnce(blockLLM, "q")).toBe("hi");
});
