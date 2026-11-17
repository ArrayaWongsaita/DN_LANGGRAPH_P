import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildRerankPrompt, rerank } from "./rerank";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const cands = [
  { id: "a", text: "เรื่องคืนเงิน" },
  { id: "b", text: "เรื่องรีเซ็ตรหัสผ่าน" },
  { id: "c", text: "เรื่องลาป่วย" },
  { id: "d", text: "เรื่องรหัสผ่านและ VPN" },
];
const scores = (...s: number[]) => JSON.stringify({ scores: s });

test("พรอมต์: มีคำถาม เอกสารเรียงหมายเลขตั้งแต่ 1 และบอกช่วงคะแนน", () => {
  const prompt = buildRerankPrompt("ลืมรหัสผ่าน", cands);
  expect(prompt).toContain("ลืมรหัสผ่าน");
  expect(prompt).toContain("1. เรื่องคืนเงิน");
  expect(prompt).toContain("4. เรื่องรหัสผ่านและ VPN");
  expect(prompt).toContain("0-10");
});

test("เรียงใหม่ตามคะแนนมากไปน้อย และตัดตาม topN", async () => {
  const llm = fakeToolLLM([scores(1, 9, 2, 8)]);
  const out = await rerank(llm, "รหัสผ่าน", cands, { topN: 2, minScore: 0 });
  expect(out.map((c) => c.id)).toEqual(["b", "d"]);
});

test("ตัดอันที่คะแนนต่ำกว่าเกณฑ์ (เท่ากับเกณฑ์ผ่าน)", async () => {
  const llm = fakeToolLLM([scores(1, 9, 5, 5)]);
  const out = await rerank(llm, "q", cands, { topN: 10, minScore: 5 });
  expect(out.map((c) => c.id)).toEqual(["b", "c", "d"]);
});

test("คะแนนเท่ากันคงลำดับเดิมของผู้สมัคร", async () => {
  const llm = fakeToolLLM([scores(7, 7, 7, 7)]);
  expect((await rerank(llm, "q", cands, { topN: 4, minScore: 0 })).map((c) => c.id)).toEqual(["a", "b", "c", "d"]);
});

test("โมเดลคืนคะแนนจำนวนไม่ตรง: ถอยกลับไปลำดับเดิม ไม่กรอง ไม่เรียงใหม่ (ยังตัดตาม topN)", async () => {
  const llm = fakeToolLLM([scores(9, 1)]);
  const out = await rerank(llm, "q", cands, { topN: 3, minScore: 5 });
  expect(out.map((c) => c.id)).toEqual(["a", "b", "c"]);
});

test("ไม่มีผู้สมัคร: ไม่เรียกโมเดล", async () => {
  const llm = fakeToolLLM(["ไม่ควรถูกเรียก"]);
  expect(await rerank(llm, "q", [], { topN: 3, minScore: 0 })).toEqual([]);
  expect(llm.calls).toHaveLength(0);
});

test("โมเดลได้รับพรอมต์ที่สร้างจากฟังก์ชันของคุณ", async () => {
  const llm = fakeToolLLM([scores(1, 2, 3, 4)]);
  await rerank(llm, "คำถามพิเศษ", cands, { topN: 1, minScore: 0 });
  expect(llm.calls[0][0].text).toBe(buildRerankPrompt("คำถามพิเศษ", cands));
});
