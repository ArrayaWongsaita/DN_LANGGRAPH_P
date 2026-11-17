import { buildFanoutGraph } from "./fanout";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ทุก item ถูกประมวลผลคนละหนึ่งงาน", async () => {
  const result = await buildFanoutGraph().invoke({ items: ["a", "b", "c"] });
  expect([...result.out].sort()).toEqual(["A", "B", "C"]);
});

test("จำนวนงานตามจำนวน item (ไม่ตายตัว)", async () => {
  const many = Array.from({ length: 20 }, (_, i) => `x${i}`);
  expect((await buildFanoutGraph().invoke({ items: many })).out).toHaveLength(20);
});

test("ไม่มี item: ไม่มีงาน", async () => {
  expect((await buildFanoutGraph().invoke({ items: [] })).out).toEqual([]);
});
