import { HumanMessage } from "@langchain/core/messages";
import { fakeLLM } from "@src/fakeLLM";
import { describeReply } from "./describeReply";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("คืน type ของคำตอบเป็น 'ai' และ text ตามที่ LLM ตอบ", async () => {
  const result = await describeReply(fakeLLM(["สบายดี"]), "เป็นไงบ้าง");
  expect(result).toEqual({ type: "ai", text: "สบายดี" });
});

test("ส่งคำถามเข้าไปเป็นข้อความของมนุษย์ (HumanMessage)", async () => {
  const llm = fakeLLM(["ok"]);
  const generate = vi.spyOn(llm as unknown as { _generate: (...a: unknown[]) => unknown }, "_generate");
  await describeReply(llm, "คำถามนี้");
  const messages = generate.mock.calls[0][0] as unknown[];
  expect(messages).toHaveLength(1);
  expect(messages[0]).toBeInstanceOf(HumanMessage);
});
