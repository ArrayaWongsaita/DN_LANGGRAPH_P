import { HumanMessage } from "@langchain/core/messages";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildPrivateAgent, buildStrictAgent } from "./pii";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ดูว่า "โมเดลได้รับอะไร"
const seenBy = async (text: string) => {
  const llm = fakeToolLLM(["ok"]);
  await buildPrivateAgent(llm).invoke({ messages: [new HumanMessage(text)] });
  return llm.calls[0][0].text;
};

test("อีเมลถูกแทนที่ก่อนถึงโมเดล", async () => {
  const seen = await seenBy("ติดต่อ somchai@example.com ด้วย");
  expect(seen).not.toContain("somchai@example.com");
  expect(seen).toContain("[REDACTED_EMAIL]");
});

test("บัตรเครดิตถูก mask เหลือสี่ตัวท้าย", async () => {
  const seen = await seenBy("บัตร 4111 1111 1111 1111");
  expect(seen).not.toContain("4111 1111 1111");
  expect(seen).toContain("1111");
  expect(seen).toContain("****");
});

test("เลขบัตรประชาชน 13 หลัก (ชนิดที่นิยามเอง) ถูกปิดบัง", async () => {
  const seen = await seenBy("เลขบัตร 1234567890123 ครับ");
  expect(seen).not.toContain("1234567890123");
  expect(seen).toContain("[REDACTED_THAI_ID]");
});

test("ข้อความที่ไม่มีข้อมูลส่วนตัวผ่านไปเหมือนเดิม", async () => {
  expect(await seenBy("สวัสดีครับ")).toBe("สวัสดีครับ");
});

test("กลยุทธ์ block: เจอแล้วโยน error และโมเดลไม่ถูกเรียก", async () => {
  const llm = fakeToolLLM(["ไม่ควรถูกเรียก"]);
  await expect(buildStrictAgent(llm).invoke({ messages: [new HumanMessage("a@b.com")] })).rejects.toThrow(/PII/);
  expect(llm.calls).toHaveLength(0);
});
