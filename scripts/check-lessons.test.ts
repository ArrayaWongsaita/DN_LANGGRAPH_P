import { checkLessons } from "./check-lessons";

const ROOT = "scripts/fixtures/lessons";

describe("checkLessons", () => {
  test("solutions: รายงานเฉพาะบทที่เฉลยไม่ผ่านตัวตรวจ", () => {
    const result = checkLessons(ROOT, "solutions");
    expect(result.ok).toBe(false);
    expect(result.problems).toHaveLength(1);
    expect(result.problems[0]).toContain("03-solution-fails");
  });

  test("starters: รายงานเฉพาะบทที่โค้ดเริ่มต้นผ่านตัวตรวจอยู่แล้ว", () => {
    const result = checkLessons(ROOT, "starters");
    expect(result.ok).toBe(false);
    expect(result.problems).toHaveLength(1);
    expect(result.problems[0]).toContain("02-starter-passes");
  });
}, 120_000);
