import { fakeToolLLM } from "@src/fakeToolLLM";
import { type Case, containsScorer, makeJudgeScorer, runEval } from "./evals";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const cases: Case[] = [
  { input: "เมืองหลวงของไทย", expected: "กรุงเทพ" },
  { input: "2+2", expected: "4" },
  { input: "สีของท้องฟ้า", expected: "ฟ้า" },
];
// "ระบบ" ที่ตอบถูก 2 ใน 3
const system = async (input: string) => (input === "2+2" ? "คำตอบคือ ห้า" : `ตอบ: ${input} คือ กรุงเทพ และ ฟ้า`);

test("scorer แบบกฎ: มีคำที่คาดหวัง = ผ่าน ไม่สนตัวพิมพ์", () => {
  expect(containsScorer("Hello World", { input: "", expected: "world" })).toBe(true);
  expect(containsScorer("Hello", { input: "", expected: "world" })).toBe(false);
});

test("runEval: นับผ่าน/ไม่ผ่าน คิดอัตรา และบอกข้อที่ตก", async () => {
  const r = await runEval(system, cases, containsScorer);
  expect(r.total).toBe(3);
  expect(r.passed).toBe(2);
  expect(r.rate).toBeCloseTo(2 / 3);
  expect(r.failures).toEqual(["2+2"]);
});

test("ชุดทดสอบว่าง: rate เป็น 0 ไม่ใช่ NaN", async () => {
  expect((await runEval(system, [], containsScorer)).rate).toBe(0);
});

test("กรรมการ: PASS ผ่าน FAIL ตก และเห็นทั้งคำถาม คำตอบที่คาดหวัง และคำตอบจริง", async () => {
  const judge = fakeToolLLM(["PASS", " fail เพราะไม่ตรง"]);
  const scorer = makeJudgeScorer(judge);
  expect(await scorer("ตอบ A", { input: "q1", expected: "A" })).toBe(true);
  expect(await scorer("ตอบ B", { input: "q2", expected: "A" })).toBe(false);
  const prompt = judge.calls[0][0].text;
  expect(prompt).toContain("q1");
  expect(prompt).toContain("A");
  expect(prompt).toContain("ตอบ A");
});
