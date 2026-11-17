import { InMemoryIndex, KeywordEmbeddings, SAMPLE_DOCS, cosine } from "./rag";

test("cosine: ทิศเดียวกัน = 1, ตั้งฉาก = 0, เวกเตอร์ศูนย์ = 0", () => {
  expect(cosine([1, 2], [2, 4])).toBeCloseTo(1);
  expect(cosine([1, 0], [0, 1])).toBe(0);
  expect(cosine([0, 0], [1, 1])).toBe(0);
});

test("KeywordEmbeddings นับคำสำคัญและให้ผลแน่นอน", async () => {
  const e = new KeywordEmbeddings();
  expect(await e.embedQuery("ลืมรหัสผ่าน เปิด VPN")).toEqual([0, 1, 1, 0, 0, 0]);
  expect(await e.embedDocuments(["ก", "ข"])).toHaveLength(2);
});

test("InMemoryIndex ค้นหาเอกสารที่ใกล้ที่สุดก่อน และจำกัด k", async () => {
  const index = new InMemoryIndex(new KeywordEmbeddings());
  await index.add(SAMPLE_DOCS);
  const hits = await index.search("ลืมรหัสผ่านทำอย่างไร", 2);
  expect(hits).toHaveLength(2);
  expect(hits[0].source).toBe("it.md");
  expect(hits[0].score).toBeGreaterThan(hits[1].score);
});
