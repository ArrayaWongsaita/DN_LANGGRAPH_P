import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { findLesson, parseLessonId } from "./find-lesson";

const num = process.argv[2] ?? "";
if (!parseLessonId(num)) {
  console.error("วิธีใช้: pnpm lesson <เลขบท>  เช่น pnpm lesson 08 (Level 1) หรือ pnpm lesson 0-01 (Level 0)");
  process.exit(1);
}

const found = findLesson(process.env.LESSONS_ROOT ?? "lessons", num);
if (!found) {
  console.error(`ไม่พบบทที่ ${num}`);
  process.exit(1);
}
if (!existsSync(join(found, "run.ts"))) {
  console.error(`บทที่ ${num} ไม่มีไฟล์ run.ts ให้รัน (ใช้ pnpm test:lesson ${num} แทน)`);
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--import", "./scripts/friendly-errors.ts", join(found, "run.ts")],
  { stdio: "inherit" },
);
if (result.error) console.error(`รันไม่สำเร็จ: ${result.error.message}`);
process.exit(result.status ?? 1);
