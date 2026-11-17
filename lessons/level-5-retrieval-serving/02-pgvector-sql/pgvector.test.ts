import { type Db, searchChunks, searchSql, toVectorLiteral, upsertChunk } from "./pgvector";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ฐานข้อมูลปลอมที่จด SQL และพารามิเตอร์ที่ได้รับ
function fakeDb(rows: Record<string, unknown>[] = []) {
  const calls: { text: string; values?: unknown[] }[] = [];
  const db: Db = {
    async query(text, values) {
      calls.push({ text, values });
      return { rows };
    },
  };
  return { db, calls };
}

test("toVectorLiteral: รูป [a,b,c] ที่ pgvector อ่านได้", () => {
  expect(toVectorLiteral([0.1, -2, 3])).toBe("[0.1,-2,3]");
  expect(toVectorLiteral([])).toBe("[]");
});

test("toVectorLiteral: ค่าที่ไม่ใช่ตัวเลขจำกัดต้องถูกปฏิเสธ", () => {
  expect(() => toVectorLiteral([1, Number.NaN])).toThrow("ไม่ใช่ตัวเลข");
  expect(() => toVectorLiteral([Number.POSITIVE_INFINITY])).toThrow("ไม่ใช่ตัวเลข");
});

test("searchSql: เรียงตามระยะ cosine จากน้อยไปมาก จำกัดจำนวน และใช้พารามิเตอร์", () => {
  const sql = searchSql();
  expect(sql).toMatch(/ORDER BY\s+embedding\s*<=>\s*\$1::vector\s+LIMIT\s+\$2/i);
  expect(sql).not.toMatch(/DESC/i);
  expect(sql).toMatch(/1\s*-\s*\(\s*embedding\s*<=>\s*\$1::vector\s*\)\s+AS\s+score/i);
  expect(sql).toMatch(/FROM\s+course_chunks/i);
});

test("searchChunks: ส่งเวกเตอร์และ k เป็นพารามิเตอร์ ไม่ต่อสตริงเข้า SQL", async () => {
  const { db, calls } = fakeDb();
  await searchChunks(db, [0.5, 0.25], 3);
  expect(calls).toHaveLength(1);
  expect(calls[0].values).toEqual(["[0.5,0.25]", 3]);
  expect(calls[0].text).not.toContain("0.5");
});

test("searchChunks: แปลงแถวเป็น Hit และ score เป็นตัวเลขแม้ฐานข้อมูลส่งเป็นสตริง", async () => {
  const { db } = fakeDb([
    { source: "it.md", text: "รีเซ็ตรหัสผ่าน", score: "0.91" },
    { source: "hr.md", text: "ลาป่วย", score: 0.4 },
  ]);
  expect(await searchChunks(db, [1], 2)).toEqual([
    { source: "it.md", text: "รีเซ็ตรหัสผ่าน", score: 0.91 },
    { source: "hr.md", text: "ลาป่วย", score: 0.4 },
  ]);
});

test("searchChunks: ไม่พบแถวเลยได้อาร์เรย์ว่าง", async () => {
  expect(await searchChunks(fakeDb([]).db, [1], 5)).toEqual([]);
});

test("upsertChunk (โค้ดที่ให้ไว้) ใช้ toVectorLiteral ของคุณและพารามิเตอร์ครบ", async () => {
  const { db, calls } = fakeDb();
  await upsertChunk(db, { id: "a", source: "s.md", text: "ข้อความ" }, [1, 2]);
  expect(calls[0].values).toEqual(["a", "s.md", "ข้อความ", "[1,2]"]);
});
