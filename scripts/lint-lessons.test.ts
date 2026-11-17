import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lintLessons } from "./lint-lessons";

const TODO_TEST = 'test.todo("ข้อ 1");\n';

function makeRoot() {
  return mkdtempSync(join(tmpdir(), "lessons-"));
}

function addLesson(
  root: string,
  level: string,
  name: string,
  opts: { readme?: boolean; solution?: boolean; exerciseBody?: string } = {},
) {
  const { readme = true, solution = true, exerciseBody = TODO_TEST } = opts;
  const dir = join(root, level, name);
  mkdirSync(dir, { recursive: true });
  if (readme) writeFileSync(join(dir, "README.md"), "# บทเรียน");
  writeFileSync(join(dir, "topic.test.ts"), exerciseBody);
  if (solution) {
    mkdirSync(join(dir, "solution"));
    writeFileSync(join(dir, "solution", "topic.test.ts"), 'test("x", () => {});\n');
  }
}

describe("lintLessons", () => {
  test("a valid lesson produces no problems", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first-test");
    expect(lintLessons(root)).toEqual([]);
  });

  test("a missing solution folder is reported with the lesson folder name", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first-test", { solution: false });
    const problems = lintLessons(root);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("01-first-test");
  });

  test("a missing README is reported", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first-test", { readme: false });
    expect(lintLessons(root).join("\n")).toContain("README");
  });

  test("an exercise file with an active test() call is flagged", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first-test", {
      exerciseBody: 'test("x", () => { expect(1).toBe(1); });\n',
    });
    expect(lintLessons(root).join("\n")).toMatch(/active test/);
  });

  test("a commented-out worked example is not flagged", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first-test", {
      exerciseBody: '// test("x", () => {});\n/* it("y", () => {}); */\ntest.todo("ข้อ 1");\n',
    });
    expect(lintLessons(root)).toEqual([]);
  });

  test("duplicate lesson numbers are flagged", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first-test");
    addLesson(root, "level-1-basics", "01-other");
    expect(lintLessons(root).join("\n")).toMatch(/duplicate/i);
  });

  test("a gap in numbering across levels is flagged", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first-test");
    addLesson(root, "level-2-practical", "03-later");
    expect(lintLessons(root).join("\n")).toMatch(/contiguous|missing number 02/i);
  });

  test("a badly named folder is flagged", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "First_Test");
    expect(lintLessons(root).join("\n")).toContain("First_Test");
  });
});
