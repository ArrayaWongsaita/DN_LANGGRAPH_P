import { findLesson } from "./find-lesson";

const ROOT = "scripts/fixtures/lessons";

test("หาโฟลเดอร์บทจากเลขบท", () => {
  expect(findLesson(ROOT, "01")).toMatch(/01-good$/);
  expect(findLesson(ROOT, "3")).toMatch(/03-solution-fails$/);
});

test("เลขบทที่ไม่มีได้ undefined", () => {
  expect(findLesson(ROOT, "99")).toBeUndefined();
});
