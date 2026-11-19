import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { findLesson, parseLessonId } from "./find-lesson";
import { buildPlayground } from "./playground-lib";
import { playgroundIdeas } from "./playground-ideas";

/** Make sure `<lesson>/playground.ts[x]` exists (rebuilt from the solution when `reset`). Returns its path and whether it was written. */
export function ensurePlayground(rawId: string, reset: boolean): { file: string; written: boolean } {
  const parsed = parseLessonId(rawId);
  if (!parsed) throw new Error("วิธีใช้: pnpm play <ระดับ>-<เลขบท>  เช่น pnpm play 1-03");
  const lessonId = `${parsed.level}-${parsed.num}`;
  const lessonDir = findLesson("lessons", lessonId);
  if (!lessonDir) throw new Error(`ไม่พบบทที่ ${lessonId}`);
  const ideas = playgroundIdeas[lessonId];
  if (!ideas) throw new Error(`บท ${lessonId} ยังไม่มี playground (ลอง pnpm lesson ${lessonId} แทน)`);

  // the solution file with the same name as the lesson's own script (some lessons keep extra solution files)
  const solutionDir = join(lessonDir, "solution");
  const own = readdirSync(lessonDir).find((f) => /\.tsx?$/.test(f) && !/^playground\.tsx?$/.test(f) && !f.endsWith(".test.ts"));
  const solutionFile =
    (own && existsSync(join(solutionDir, own)) ? own : undefined) ??
    (existsSync(solutionDir) ? readdirSync(solutionDir).find((f) => /\.tsx?$/.test(f)) : undefined);
  if (!solutionFile) throw new Error(`บท ${lessonId} ไม่มีไฟล์เฉลยให้สร้าง playground`);

  const file = join(lessonDir, solutionFile.endsWith(".tsx") ? "playground.tsx" : "playground.ts");
  if (!reset && existsSync(file)) return { file, written: false };
  writeFileSync(file, buildPlayground({ id: lessonId, lessonDir, source: readFileSync(join(solutionDir, solutionFile), "utf8"), ideas }));
  return { file, written: true };
}
