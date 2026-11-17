import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const NAME_RE = /^(\d{2})-[a-z0-9-]+$/;

const dirs = (p: string) =>
  readdirSync(p).filter((n) => statSync(join(p, n)).isDirectory());

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

/** Returns human-readable problems; an empty array means every lesson is OK. */
export function lintLessons(root: string): string[] {
  const problems: string[] = [];
  const numbers: number[] = [];
  if (!existsSync(root)) return [`lessons root not found: ${root}`];

  const levels = dirs(root).filter((n) => n.startsWith("level-")).sort();
  for (const level of levels) {
    for (const name of dirs(join(root, level)).sort()) {
      const dir = join(root, level, name);
      const m = NAME_RE.exec(name);
      if (!m) {
        problems.push(`${name}: folder name must match NN-slug (lowercase, digits, hyphens)`);
        continue;
      }
      numbers.push(Number(m[1]));

      if (!existsSync(join(dir, "README.md"))) {
        problems.push(`${name}: missing README.md`);
      }
      const tests = readdirSync(dir).filter((f) => f.endsWith(".test.ts"));
      if (tests.length === 0) problems.push(`${name}: no *.test.ts exercise file`);

      const solutionDir = join(dir, "solution");
      if (!existsSync(solutionDir)) {
        problems.push(`${name}: missing solution/ folder`);
      } else {
        for (const t of tests) {
          if (!existsSync(join(solutionDir, t))) {
            problems.push(`${name}: solution/ is missing ${t}`);
          }
        }
      }

      for (const t of tests) {
        const code = stripComments(readFileSync(join(dir, t), "utf8"));
        if (/\b(test|it)\s*\(/.test(code)) {
          problems.push(`${name}: ${t} has an active test() call; exercises must be test.todo`);
        }
      }
    }
  }

  const seen = new Set<number>();
  for (const n of numbers) {
    if (seen.has(n)) problems.push(`duplicate lesson number ${String(n).padStart(2, "0")}`);
    seen.add(n);
  }
  const max = Math.max(0, ...numbers);
  for (let i = 1; i <= max; i++) {
    if (!seen.has(i)) {
      problems.push(`numbering must be contiguous: missing number ${String(i).padStart(2, "0")}`);
    }
  }
  return problems;
}
