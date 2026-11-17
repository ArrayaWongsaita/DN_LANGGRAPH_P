import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildRouter } from "./routing";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) สคริปต์: ครั้งแรกคือจัดประเภท (JSON) ครั้งที่สองคือผู้เชี่ยวชาญตอบ
test("คำถามเรื่องบิล: ไปที่ผู้เชี่ยวชาญด้านการเงิน", async () => {
  const llm = fakeToolLLM(['{"category":"billing"}', "คืนเงินใน 7 วัน"]);
  const r = await buildRouter(llm).invoke({ question: "ขอคืนเงิน" });
  expect(r.category).toBe("billing");
  expect(r.answer).toBe("คืนเงินใน 7 วัน");
  expect(llm.calls[1][0].text).toContain("เจ้าหน้าที่การเงิน");
});

test("คำถามเทคนิค: ไปที่ช่าง", async () => {
  const llm = fakeToolLLM(['{"category":"tech"}', "รีสตาร์ตเครื่อง"]);
  await buildRouter(llm).invoke({ question: "เน็ตหลุด" });
  expect(llm.calls[1][0].text).toContain("ช่างเทคนิค");
});

test("ประเภทอื่น: ไป other", async () => {
  const llm = fakeToolLLM(['{"category":"other"}', "ยินดีครับ"]);
  await buildRouter(llm).invoke({ question: "สวัสดี" });
  expect(llm.calls[1][0].text).toContain("ผู้ช่วยทั่วไป");
});

test("LLM ตอบประเภทนอกชุด: ถูกปฏิเสธ (enum กันไว้)", async () => {
  const llm = fakeToolLLM(['{"category":"hacker"}']);
  await expect(buildRouter(llm).invoke({ question: "x" })).rejects.toThrow();
});

test("prompt จัดประเภทมีคำถามอยู่ข้างใน", async () => {
  const llm = fakeToolLLM(['{"category":"tech"}', "ok"]);
  await buildRouter(llm).invoke({ question: "คำถามเฉพาะ" });
  expect(llm.calls[0][0].text).toContain("คำถามเฉพาะ");
});
