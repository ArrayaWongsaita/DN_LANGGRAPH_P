import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const NAME_RE = /^(\d{2})-[a-z0-9-]+$/;

const dirs = (p: string) => readdirSync(p).filter((n) => statSync(join(p, n)).isDirectory());

// starter = ไฟล์ .ts ในโฟลเดอร์บทที่ไม่ใช่ checker (.test.ts) และไม่ใช่ run.ts
const isStarter = (f: string) => f.endsWith(".ts") && !f.endsWith(".test.ts") && f !== "run.ts";

/** คืนรายการปัญหา (ภาษาอ่านง่าย) ถ้าว่างแปลว่าผ่าน. strict = ตรวจว่าเลขบทต่อเนื่องไม่ข้าม */
export function lintLessons(root: string, opts: { strict?: boolean } = {}): string[] {
  const problems: string[] = [];
  if (!existsSync(root)) return [`lessons root not found: ${root}`];

  for (const level of dirs(root).filter((n) => n.startsWith("level-")).sort()) {
    const numbers: number[] = [];
    for (const name of dirs(join(root, level)).sort()) {
      const dir = join(root, level, name);
      const m = NAME_RE.exec(name);
      if (!m) {
        problems.push(`${name}: folder name must match NN-slug (lowercase, digits, hyphens)`);
        continue;
      }
      numbers.push(Number(m[1]));

      if (!existsSync(join(dir, "README.md"))) problems.push(`${name}: missing README.md`);

      const files = readdirSync(dir).filter((f) => statSync(join(dir, f)).isFile());
      const checkers = files.filter((f) => f.endsWith(".test.ts"));
      const starters = files.filter(isStarter);
      // บทแบบไฟล์เดียวไม่มี checker ได้ แต่ต้องมีไฟล์เรียนไฟล์เดียว (ไฟล์นั้นรันตัวเองด้วย pnpm lesson)
      if (checkers.length === 0 && starters.length !== 1) problems.push(`${name}: no *.test.ts checker (a single-file lesson needs exactly one starter .ts)`);

      const solutionDir = join(dir, "solution");
      if (!existsSync(solutionDir)) {
        problems.push(`${name}: missing solution/ folder`);
      } else {
        const solutionFiles = readdirSync(solutionDir);
        for (const s of starters) {
          if (!solutionFiles.includes(s)) problems.push(`${name}: solution/ is missing ${s}`);
        }
        for (const f of solutionFiles.filter((f) => f.endsWith(".test.ts"))) {
          problems.push(`${name}: solution/ must not contain a checker (${f})`);
        }
      }

      for (const s of starters) {
        if (!readFileSync(join(dir, s), "utf8").includes("todo(")) {
          problems.push(`${name}: starter ${s} has no todo( gap`);
        }
      }
      for (const c of checkers) {
        const code = readFileSync(join(dir, c), "utf8");
        if (code.includes("getLLM")) problems.push(`${name}: checker ${c} must not use getLLM (use fakeLLM)`);
        if (code.includes("todo(")) problems.push(`${name}: checker ${c} must not contain todo(`);
      }
    }
    const seen = new Set<number>();
    for (const n of numbers) {
      if (seen.has(n)) problems.push(`duplicate lesson number ${String(n).padStart(2, "0")} in ${level}`);
      seen.add(n);
    }
    if (opts.strict) {
      const max = Math.max(0, ...numbers);
      for (let i = 1; i <= max; i++) {
        if (!seen.has(i)) problems.push(`numbering must be contiguous in ${level}: missing number ${String(i).padStart(2, "0")}`);
      }
    }
  }

  return problems;
}
