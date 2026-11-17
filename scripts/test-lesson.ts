import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { findLesson } from "./find-lesson";

const num = process.argv[2] ?? "";
const dir = findLesson("lessons", num);
if (!dir) {
  console.error("วิธีใช้: pnpm test:lesson <เลขบท>  เช่น pnpm test:lesson 01 (Level 1) หรือ pnpm test:lesson 0-01 (Level 0) (ไม่พบบทนี้)");
  process.exit(1);
}

const vitest = join(process.cwd(), "node_modules", "vitest", "vitest.mjs");
const result = spawnSync(process.execPath, [vitest, "run", dir], { stdio: "inherit" });
process.exit(result.status ?? 1);
