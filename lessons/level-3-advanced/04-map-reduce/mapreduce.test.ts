import { buildMapReduceGraph } from "./mapreduce";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("นับคำของแต่ละเอกสาร (map)", async () => {
  const r = await buildMapReduceGraph().invoke({ docs: ["a b c", "d e", "f"] });
  expect([...r.counts].sort()).toEqual([1, 2, 3]);
});

test("รวมผลทุกเอกสาร (reduce) หลัง map เสร็จหมด", async () => {
  const r = await buildMapReduceGraph().invoke({ docs: ["a b c", "d e", "f"] });
  expect(r.total).toBe(6);
});

test("sum รันครั้งเดียวหลังทุกงาน ไม่ใช่ทุกงาน (ผลรวมไม่ซ้ำ)", async () => {
  const docs = Array.from({ length: 10 }, () => "x y");
  expect((await buildMapReduceGraph().invoke({ docs })).total).toBe(20);
});
