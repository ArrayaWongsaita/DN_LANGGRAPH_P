import { spawnSync } from "node:child_process";
import { ensurePlayground } from "./playground-files";

const [id = "", ...flags] = process.argv.slice(2);
const watch = flags.includes("--watch");
const reset = flags.includes("--reset");

let result: ReturnType<typeof ensurePlayground>;
try {
  result = ensurePlayground(id, reset);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
if (result.written) console.log(`สร้าง ${result.file} แล้ว เปิดไฟล์นี้แก้ได้เลย (เริ่มใหม่: pnpm play ${id} --reset)\n`);

const nodeArgs = [...(watch ? ["--watch"] : []), "--import", "tsx", "--import", "./scripts/friendly-errors.ts", result.file];
const run = spawnSync(process.execPath, nodeArgs, { stdio: "inherit" });
if (run.error) console.error(`รันไม่สำเร็จ: ${run.error.message}`);
process.exit(run.status ?? 1);
