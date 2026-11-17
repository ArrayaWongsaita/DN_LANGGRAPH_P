import { KeywordEmbeddings } from "@src/rag";
import { cosineSimilarity, rank } from "./embed";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("cosine: ทิศเดียวกัน 1, ตั้งฉาก 0, ตรงข้าม -1", () => {
  expect(cosineSimilarity([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
  expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  expect(cosineSimilarity([1, 1], [-1, -1])).toBeCloseTo(-1);
});

test("cosine: เวกเตอร์ศูนย์คืน 0 ไม่ใช่ NaN", () => {
  expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
});

test("rank: เอกสารที่ตรงกับคำถามที่สุดมาก่อน", async () => {
  const docs = ["ลืมรหัสผ่านให้รีเซ็ต", "คืนเงินได้ใน 7 วัน", "ลาป่วยได้ 30 วัน"];
  const out = await rank("ลืมรหัสผ่านทำไง", docs, new KeywordEmbeddings(), 3);
  expect(out[0].text).toBe("ลืมรหัสผ่านให้รีเซ็ต");
  expect(out[0].score).toBeGreaterThan(out[1].score);
});

test("rank: จำกัดจำนวนตาม k และไม่แก้อาร์เรย์เดิม", async () => {
  const docs = ["ลา", "คืนเงิน", "จัดส่ง"];
  const copy = [...docs];
  expect(await rank("ลา", docs, new KeywordEmbeddings(), 2)).toHaveLength(2);
  expect(docs).toEqual(copy);
});
