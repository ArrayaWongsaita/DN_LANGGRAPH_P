import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * รหัสบท: "3" หรือ "03" = Level 1, "0-03" = Level 0, "1-03" = Level 1
 * (เลขบทนับแยกตามระดับ)
 */
export function parseLessonId(id: string): { level: number; num: string } | undefined {
  const m = /^(?:(\d+)-)?(\d{1,2})$/.exec(id);
  if (!m) return undefined;
  return { level: m[1] === undefined ? 1 : Number(m[1]), num: m[2].padStart(2, "0") };
}

/** หาโฟลเดอร์ของบทจากรหัสบท ภายใต้ root/level-<n>-*\/ */
export function findLesson(root: string, id: string): string | undefined {
  const parsed = parseLessonId(id);
  if (!parsed) return undefined;
  const levelPrefix = `level-${parsed.level}-`;
  const lessonPrefix = `${parsed.num}-`;
  for (const level of readdirSync(root).sort()) {
    if (!level.startsWith(levelPrefix)) continue;
    const levelDir = join(root, level);
    if (!statSync(levelDir).isDirectory()) continue;
    for (const name of readdirSync(levelDir).sort()) {
      if (name.startsWith(lessonPrefix) && statSync(join(levelDir, name)).isDirectory()) {
        return join(levelDir, name);
      }
    }
  }
  return undefined;
}
