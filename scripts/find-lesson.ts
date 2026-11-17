import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** หาโฟลเดอร์ของบทจากเลขบท (เช่น "3" หรือ "03") ภายใต้ root/level-*\/ */
export function findLesson(root: string, num: string): string | undefined {
  const prefix = `${num.padStart(2, "0")}-`;
  for (const level of readdirSync(root).sort()) {
    const levelDir = join(root, level);
    if (!statSync(levelDir).isDirectory()) continue;
    for (const name of readdirSync(levelDir).sort()) {
      if (name.startsWith(prefix) && statSync(join(levelDir, name)).isDirectory()) {
        return join(levelDir, name);
      }
    }
  }
  return undefined;
}
