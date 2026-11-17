import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

export type CheckMode = "solutions" | "starters";

const VITEST = join(process.cwd(), "node_modules", "vitest", "vitest.mjs");

interface Summary {
  total: number;
  failed: number;
}

function runVitest(target: string): Summary {
  const out = join(process.cwd(), ".tmp-check-result.json");
  rmSync(out, { force: true });
  spawnSync(
    process.execPath,
    [VITEST, "run", "--config", "vitest.check.config.ts", "--reporter=json", `--outputFile=${out}`, target],
    { encoding: "utf8" },
  );
  if (!existsSync(out)) return { total: 0, failed: 0 };
  const json = JSON.parse(readFileSync(out, "utf8")) as { numTotalTests: number; numFailedTests: number };
  rmSync(out, { force: true });
  return { total: json.numTotalTests, failed: json.numFailedTests };
}

/**
 * solutions: ทุกบทต้อง "ผ่าน" เมื่อเอา solution/ ไปแทน starter
 * starters: ทุกบทต้อง "แดงอย่างน้อย 1 ข้อ" ตอนยังเป็น starter (กันบทที่เฉลยในตัวไปแล้ว)
 */
export function checkLessons(root: string, mode: CheckMode): { ok: boolean; problems: string[] } {
  const problems: string[] = [];
  const tmpBase = join(dirname(resolve(root)), ".tmp-check");
  rmSync(tmpBase, { recursive: true, force: true });

  for (const level of readdirSync(root).sort()) {
    const levelDir = join(root, level);
    if (!statSync(levelDir).isDirectory()) continue;
    for (const lesson of readdirSync(levelDir).sort()) {
      const lessonDir = join(levelDir, lesson);
      if (!statSync(lessonDir).isDirectory()) continue;

      if (mode === "starters") {
        const r = runVitest(lessonDir);
        if (r.total === 0) problems.push(`${lesson}: checker ran no tests`);
        else if (r.failed === 0) problems.push(`${lesson}: starter already passes its checker (the lesson is solved without any gap filled)`);
        continue;
      }

      const tmpLesson = join(tmpBase, level, lesson);
      mkdirSync(tmpLesson, { recursive: true });
      cpSync(lessonDir, tmpLesson, { recursive: true, filter: (src) => !src.endsWith("solution") });
      const solutionDir = join(lessonDir, "solution");
      if (existsSync(solutionDir)) cpSync(solutionDir, tmpLesson, { recursive: true });
      const r = runVitest(tmpLesson);
      if (r.total === 0) problems.push(`${lesson}: checker ran no tests`);
      else if (r.failed > 0) problems.push(`${lesson}: solution fails its checker (${r.failed}/${r.total} tests failed)`);
    }
  }

  rmSync(tmpBase, { recursive: true, force: true });
  return { ok: problems.length === 0, problems };
}
