import { buildPipeline } from "./pipeline";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ต้องคอมไพล์ได้และเดินผ่านทั้งสอง node", async () => {
  const result = await buildPipeline().invoke({});
  expect(result.trace).toContain("first");
  expect(result.trace).toContain("second");
});

test("ลำดับต้องเป็น first แล้ว second", async () => {
  const result = await buildPipeline().invoke({});
  expect(result.trace).toBe("first>second");
});
