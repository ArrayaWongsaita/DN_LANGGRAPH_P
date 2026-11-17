import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lintLessons } from "./lint-lessons";

interface Opts {
  readme?: boolean;
  solution?: boolean;
  solutionFile?: boolean;
  starter?: string;
  checker?: string;
}

function makeRoot() {
  return mkdtempSync(join(tmpdir(), "lessons-"));
}

function addLesson(root: string, level: string, name: string, o: Opts = {}) {
  const {
    readme = true,
    solution = true,
    solutionFile = true,
    starter = 'import { todo } from "@src/todo";\nexport const a = () => todo(1);\n',
    checker = 'test("x", () => {});\n',
  } = o;
  const dir = join(root, level, name);
  mkdirSync(dir, { recursive: true });
  if (readme) writeFileSync(join(dir, "README.md"), "# บทเรียน");
  writeFileSync(join(dir, "topic.ts"), starter);
  writeFileSync(join(dir, "topic.test.ts"), checker);
  if (solution) {
    mkdirSync(join(dir, "solution"));
    if (solutionFile) writeFileSync(join(dir, "solution", "topic.ts"), "export const a = () => 1;\n");
  }
}

describe("lintLessons", () => {
  test("บทที่ถูกต้องไม่มีปัญหา", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first");
    expect(lintLessons(root)).toEqual([]);
  });

  test("ไม่มี README", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first", { readme: false });
    expect(lintLessons(root).join("\n")).toContain("README");
  });

  test("ไม่มี solution/ ถูกรายงานพร้อมชื่อโฟลเดอร์", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first", { solution: false });
    const problems = lintLessons(root);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("01-first");
  });

  test("solution/ ขาดไฟล์ starter", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first", { solutionFile: false });
    expect(lintLessons(root).join("\n")).toMatch(/solution.*topic\.ts/);
  });

  test("starter ที่ไม่มี todo( ถูกรายงาน", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first", { starter: "export const a = () => 1;\n" });
    expect(lintLessons(root).join("\n")).toMatch(/todo\(/);
  });

  test("checker ที่ใช้ getLLM หรือมี todo( ถูกรายงาน", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first", { checker: 'import { getLLM } from "@src/llm";\n' });
    expect(lintLessons(root).join("\n")).toMatch(/getLLM/);
  });

  test("เลขบทซ้ำถูกรายงานเสมอ", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first");
    addLesson(root, "level-1-basics", "01-other");
    expect(lintLessons(root).join("\n")).toMatch(/duplicate/i);
  });

  test("เลขบทข้าม: ผ่านเมื่อไม่ strict แต่ถูกรายงานเมื่อ strict", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "01-first");
    addLesson(root, "level-1-basics", "03-later");
    expect(lintLessons(root)).toEqual([]);
    expect(lintLessons(root, { strict: true }).join("\n")).toMatch(/missing number 02/);
  });

  test("เลขบทเดียวกันใน level ต่างกันไม่ใช่ซ้ำ", () => {
    const root = makeRoot();
    addLesson(root, "level-0-fetch", "01-zero");
    addLesson(root, "level-1-basics", "01-one");
    expect(lintLessons(root, { strict: true })).toEqual([]);
  });

  test("strict ตรวจเลขต่อเนื่องแยกตาม level", () => {
    const root = makeRoot();
    addLesson(root, "level-0-fetch", "01-a");
    addLesson(root, "level-0-fetch", "03-c");
    addLesson(root, "level-1-basics", "01-x");
    addLesson(root, "level-1-basics", "02-y");
    const problems = lintLessons(root, { strict: true }).join("\n");
    expect(problems).toMatch(/level-0-fetch.*missing number 02/);
    expect(problems).not.toMatch(/level-1-basics/);
  });

  test("ชื่อโฟลเดอร์ผิดรูปแบบ", () => {
    const root = makeRoot();
    addLesson(root, "level-1-basics", "First_Test");
    expect(lintLessons(root).join("\n")).toContain("First_Test");
  });
});
