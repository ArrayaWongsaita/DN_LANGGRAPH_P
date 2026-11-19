import { posix } from "node:path";

export interface PlaygroundInput {
  /** lesson id, e.g. "1-03" */
  id: string;
  /** lesson folder relative to the repo root, e.g. "lessons/level-1-basics/03-first-llm-call" */
  lessonDir: string;
  /** source of the lesson's solution file */
  source: string;
  /** Thai suggestions shown at the top of the file */
  ideas: string[];
}

const BANNER = "ส่วนตรวจคำตอบ";

/** Split the source into import statements (possibly multi-line) and the remaining lines. */
function splitImports(lines: string[]): { imports: string[]; rest: string[] } {
  const imports: string[] = [];
  const rest: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^import[\s{"']/.test(lines[i])) {
      rest.push(lines[i]);
      continue;
    }
    let stmt = lines[i];
    while (!/(from\s+["'][^"']+["']|^import\s+["'][^"']+["'])\s*;?/.test(stmt) && i + 1 < lines.length) stmt += "\n" + lines[++i];
    imports.push(stmt);
  }
  return { imports, rest };
}

/** Local names an import statement binds; empty for a side-effect import. */
function boundNames(stmt: string): string[] {
  const m = /^import\s+(?:type\s+)?([\s\S]*?)\s+from\s+["']/.exec(stmt);
  if (!m) return [];
  const names: string[] = [];
  const clause = m[1];
  const named = /\{([\s\S]*?)\}/.exec(clause);
  if (named) {
    for (const part of named[1].split(",")) {
      const t = part.trim().replace(/^type\s+/, "");
      if (t) names.push(t.split(/\s+as\s+/).pop()!.trim());
    }
  }
  const outside = clause.replace(/\{[\s\S]*?\}/, "").replace(/,/g, " ").trim();
  for (const part of outside.split(/\s+/)) {
    if (!part) continue;
    names.push(part === "*" || part === "as" ? "" : part);
  }
  return names.filter((n) => n && n !== "*" && n !== "as");
}

function needs(source: string, imports: string[]): string[] {
  const out: string[] = [];
  if (/DATABASE_URL/.test(source)) out.push("Postgres ของคอร์ส (docker compose up -d --wait) และ DATABASE_URL ใน .env");
  if (/startDevServer/.test(source)) out.push("langgraph dev (เริ่มให้เองผ่าน startDevServer)");
  if (/getEmbeddings/.test(source)) out.push("key ของ embedding ใน .env");
  if (imports.some((i) => /02-llm-config\/solution\/llm/.test(i))) out.push("key ของ LLM ที่ตั้งไว้ในบท 1-02");
  return out;
}

/**
 * Turn a lesson's solution into a playground file: only the imports the lesson code uses
 * (relative ones rewritten to `@lessons/...`), plus a header with ideas. The learner writes the code.
 */
export function buildPlayground({ id, lessonDir, source, ideas }: PlaygroundInput): string {
  const solutionDir = posix.join(lessonDir, "solution");
  const all = source.split("\n");
  const at = all.findIndex((l) => l.includes(BANNER));
  const main = at === -1 ? all : all.slice(0, at);
  const { imports: found } = splitImports(main);
  const body = splitImports(main).rest.join("\n");

  const kept = found
    .filter((stmt) => !/["']@src\/check["']/.test(stmt))
    .filter((stmt) => {
      const names = boundNames(stmt);
      return names.length === 0 || names.some((n) => new RegExp(`(^|[^\\w$])${n.replace(/\$/g, "\\$")}([^\\w$]|$)`).test(body));
    })
    .map((stmt) =>
      stmt.replace(/(from\s+["']|^import\s+["'])(\.{1,2}\/[^"']+)(["'])/m, (_m, a: string, rel: string, b: string) => {
        const abs = posix.normalize(posix.join(solutionDir, rel));
        return `${a}@lessons/${abs.replace(/^lessons\//, "")}${b}`;
      }),
    );
  const need = needs(source, kept);

  return [
    `// Playground ของบท ${id}: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล`,
    `// รันด้วย: pnpm play ${id}   (รันซ้ำทุกครั้งที่บันทึก: pnpm play ${id} --watch)`,
    `// เริ่มใหม่: pnpm play ${id} --reset`,
    ...(need.length ? ["//", `// ต้องใช้: ${need.join(", ")}`] : []),
    "//",
    "// ลองทำดู:",
    ...ideas.map((idea, i) => `//   ${i + 1}) ${idea}`),
    "",
    ...kept,
    "",
    "// เขียนโค้ดของคุณตรงนี้",
    "",
  ].join("\n");
}
