import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { findLesson, parseLessonId } from "./find-lesson";

const num = process.argv[2] ?? "";
if (!parseLessonId(num)) {
  console.error("วิธีใช้: pnpm lesson <ระดับ>-<เลขบท>  เช่น pnpm lesson 1-08 (Level 1) หรือ pnpm lesson 2-03 (Level 2)");
  process.exit(1);
}

const found = findLesson(process.env.LESSONS_ROOT ?? "lessons", num);
if (!found) {
  console.error(`ไม่พบบทที่ ${num}`);
  process.exit(1);
}
// บทแบบไฟล์เดียว: ไม่มี run.ts ให้รันไฟล์ .ts ไฟล์เดียวของบทแทน
const entries = readdirSync(found).filter((f) => /\.tsx?$/.test(f) && !f.endsWith(".test.ts"));
const entry = existsSync(join(found, "run.ts")) ? "run.ts" : entries.length === 1 ? entries[0] : undefined;
if (!entry) {
  console.error(`บทที่ ${num} ไม่มีไฟล์ให้รัน (ใช้ pnpm test:lesson ${num} แทน)`);
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--import", "./scripts/friendly-errors.ts", join(found, entry)],
  { stdio: "inherit" },
);
if (result.error) console.error(`รันไม่สำเร็จ: ${result.error.message}`);
process.exit(result.status ?? 1);
