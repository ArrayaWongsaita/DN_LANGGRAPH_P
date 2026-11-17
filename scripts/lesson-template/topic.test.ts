import { example } from "./topic";

// ตัวตรวจของบทนี้ (ผู้เรียนไม่ต้องแก้ไฟล์นี้)
test("example(1, 2) ต้องได้ 3", () => {
  expect(example(1, 2)).toBe(3);
});
