import { buildCrawlGraph, collectProgress } from "./progress";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ได้ความคืบหน้าครบทุกหน้า ตามลำดับ", async () => {
  expect(await collectProgress(buildCrawlGraph(), 3)).toEqual(["1/3", "2/3", "3/3"]);
});

test("ไม่มีหน้า ไม่มีความคืบหน้า", async () => {
  expect(await collectProgress(buildCrawlGraph(), 0)).toEqual([]);
});

test("invoke ปกติไม่พัง (writer ไม่ได้ใช้) และผลลัพธ์ยังเป็นปกติ", async () => {
  expect((await buildCrawlGraph().invoke({ pages: 2 })).done).toBe("ครบ 2 หน้า");
});
