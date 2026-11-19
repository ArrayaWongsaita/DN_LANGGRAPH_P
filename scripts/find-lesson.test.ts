import { findLesson, parseLessonId } from "./find-lesson";

const ROOT = "scripts/fixtures/lessons";

describe("parseLessonId", () => {
  test("เลขเปล่าไม่รับ ต้องระบุระดับเสมอ", () => {
    expect(parseLessonId("3")).toBeUndefined();
    expect(parseLessonId("03")).toBeUndefined();
  });

  test("รูปแบบ <level>-<เลข> ระบุระดับ", () => {
    expect(parseLessonId("0-03")).toEqual({ level: 0, num: "03" });
    expect(parseLessonId("1-3")).toEqual({ level: 1, num: "03" });
  });

  test("รูปแบบผิดได้ undefined", () => {
    expect(parseLessonId("x")).toBeUndefined();
    expect(parseLessonId("0-")).toBeUndefined();
    expect(parseLessonId("")).toBeUndefined();
    expect(parseLessonId("1-2-3")).toBeUndefined();
  });
});

describe("findLesson", () => {
  test("1-NN หาใน Level 1", () => {
    expect(findLesson(ROOT, "1-01")).toMatch(/level-1-fixture\/01-good$/);
    expect(findLesson(ROOT, "1-3")).toMatch(/03-solution-fails$/);
  });

  test("0-NN หาใน Level 0 แม้เลขซ้ำกับ Level 1", () => {
    expect(findLesson(ROOT, "0-01")).toMatch(/level-0-fixture\/01-zero-good$/);
  });

  test("บทหรือระดับที่ไม่มีได้ undefined", () => {
    expect(findLesson(ROOT, "1-99")).toBeUndefined();
    expect(findLesson(ROOT, "0-99")).toBeUndefined();
    expect(findLesson(ROOT, "7-01")).toBeUndefined();
  });
});
