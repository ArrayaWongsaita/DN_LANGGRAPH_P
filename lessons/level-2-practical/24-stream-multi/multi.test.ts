import { timeline } from "./multi";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ได้ทั้งความคืบหน้าและผลของ node ตามลำดับเวลา", async () => {
  expect(await timeline(2)).toEqual(["custom:1", "custom:2", "updates:crawl"]);
});

test("ไม่มีหน้า: เหลือเฉพาะ updates", async () => {
  expect(await timeline(0)).toEqual(["updates:crawl"]);
});
