import { fakeToolLLM } from "@src/fakeToolLLM";
import type { Hit } from "@src/rag";
import { answerWithCitations } from "./cite";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const hits: Hit[] = [
  { source: "it.md", text: "รีเซ็ตรหัสผ่านที่พอร์ทัล", score: 0.9 },
  { source: "hr.md", text: "ลาป่วยได้ 30 วัน", score: 0.2 },
];
const reply = (answer: string, sources: string[]) => JSON.stringify({ answer, sources });

test("อ้างแหล่งที่มีจริง: ผ่าน และ grounded", async () => {
  const llm = fakeToolLLM([reply("ไปที่พอร์ทัล", ["it.md"])]);
  expect(await answerWithCitations(llm, "ลืมรหัสผ่าน", hits)).toEqual({
    answer: "ไปที่พอร์ทัล",
    sources: ["it.md"],
    grounded: true,
  });
});

test("โมเดลมั่วอ้างไฟล์ที่ไม่เคยได้รับ: ถูกกรองออก เหลือแต่ของจริง", async () => {
  const llm = fakeToolLLM([reply("ตอบ", ["it.md", "ghost.md"])]);
  const r = await answerWithCitations(llm, "q", hits);
  expect(r.sources).toEqual(["it.md"]);
  expect(r.grounded).toBe(true);
});

test("อ้างแต่ไฟล์ที่ไม่มีจริงทั้งหมด หรือไม่อ้างเลย: ไม่มีหลักฐาน (grounded false)", async () => {
  expect((await answerWithCitations(fakeToolLLM([reply("ตอบ", ["ghost.md"])]), "q", hits)).grounded).toBe(false);
  expect((await answerWithCitations(fakeToolLLM([reply("ตอบ", [])]), "q", hits)).grounded).toBe(false);
});

test("โมเดลเห็นที่มาของทุกชิ้นใน prompt", async () => {
  const llm = fakeToolLLM([reply("ตอบ", ["it.md"])]);
  await answerWithCitations(llm, "คำถามของฉัน", hits);
  const prompt = llm.calls[0][0].text;
  expect(prompt).toContain("[it.md] รีเซ็ตรหัสผ่านที่พอร์ทัล");
  expect(prompt).toContain("[hr.md]");
  expect(prompt).toContain("คำถามของฉัน");
});

test("ชื่อไฟล์ที่ลงท้ายคล้ายกันไม่นับ (edit.md ไม่ใช่ it.md)", async () => {
  const r = await answerWithCitations(fakeToolLLM([reply("ตอบ", ["edit.md"])]), "q", hits);
  expect(r.sources).toEqual([]);
  expect(r.grounded).toBe(false);
});
