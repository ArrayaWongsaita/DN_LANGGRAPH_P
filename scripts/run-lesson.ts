import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const num = (process.argv[2] ?? "").padStart(2, "0");
if (!/^\d{2}$/.test(num)) {
  console.error("วิธีใช้: npm run lesson <เลขบท>  เช่น npm run lesson 03");
  process.exit(1);
}

const root = "lessons";
let found: string | undefined;
for (const level of readdirSync(root)) {
  const levelDir = join(root, level);
  if (!statSync(levelDir).isDirectory()) continue;
  for (const name of readdirSync(levelDir)) {
    if (name.startsWith(`${num}-`)) found = join(levelDir, name);
  }
}

if (!found || !existsSync(join(found, "run.ts"))) {
  console.error(`บท ${num} ไม่มีไฟล์ run.ts ให้รัน (บทนี้ใช้ npm test อย่างเดียว)`);
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--import", "./scripts/friendly-errors.ts", join(found, "run.ts")],
  { stdio: "inherit" },
);
if (result.error) console.error(`รันไม่สำเร็จ: ${result.error.message}`);
process.exit(result.status ?? 1);
