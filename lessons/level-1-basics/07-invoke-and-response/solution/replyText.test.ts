import { AIMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { fakeLLM } from "../../../../src/fakeLLM";
import { replyText } from "./replyText";

test("คืนข้อความที่ LLM ตอบ", async () => {
  expect(await replyText(fakeLLM(["สวัสดี"]), "ทัก")).toBe("สวัสดี");
});

test("เรียกสองครั้งได้สองคำตอบตามลำดับ", async () => {
  const llm = fakeLLM(["หนึ่ง", "สอง"]);
  expect(await replyText(llm, "q")).toBe("หนึ่ง");
  expect(await replyText(llm, "q")).toBe("สอง");
});

test("ถ้า content เป็น array ของ block ก็ยังได้ข้อความ", async () => {
  const blockLLM = {
    invoke: async () => new AIMessage({ content: [{ type: "text", text: "hi" }] }),
  } as unknown as BaseChatModel;
  expect(await replyText(blockLLM, "q")).toBe("hi");
});
