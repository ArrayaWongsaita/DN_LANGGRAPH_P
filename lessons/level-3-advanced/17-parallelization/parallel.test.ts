import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildParallel } from "./parallel";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const make = () => ({
  safety: fakeToolLLM(["ปลอดภัย"]),
  tone: fakeToolLLM(["สุภาพ"]),
  length: fakeToolLLM(["กำลังดี"]),
});

test("รายงานรวมผลทั้งสามด้านครบ", async () => {
  const r = await buildParallel(make()).invoke({ text: "สวัสดีครับ" });
  expect(r.report).toBe("ปลอดภัย | สุภาพ | กำลังดี");
});

test("ทั้งสามด้านได้รับข้อความต้นฉบับ", async () => {
  const c = make();
  await buildParallel(c).invoke({ text: "ข้อความทดสอบ" });
  for (const llm of [c.safety, c.tone, c.length]) expect(llm.calls[0][0].text).toContain("ข้อความทดสอบ");
});

test("makeReport รันครั้งเดียวหลังทุกด้านเสร็จ (ทุก checker ถูกเรียกครั้งเดียว)", async () => {
  const c = make();
  await buildParallel(c).invoke({ text: "x" });
  expect([c.safety.calls.length, c.tone.calls.length, c.length.calls.length]).toEqual([1, 1, 1]);
});
