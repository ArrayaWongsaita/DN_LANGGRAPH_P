export interface Db {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

export interface Options {
  allowedTables: string[];
  maxRows: number;
}

export type Validation = { ok: true; sql: string } | { ok: false; reason: string };

export function stripLiterals(sql: string): string {
  return sql.replace(/'(?:[^']|'')*'/g, "?");
}

const FORBIDDEN = [
  "insert", "update", "delete", "drop", "alter", "create", "grant", "revoke", "truncate", "copy", "call", "do",
  "set", "reset", "into", "execute", "vacuum", "lock", "listen", "notify", "pg_sleep", "pg_read_file",
];

export function checkStatement(sql: string): string | null {
  const s = stripLiterals(sql).trim();
  if (s === "") return "คำสั่งว่างเปล่า";
  if (s.includes("'")) return "string literal ไม่ปิดเครื่องหมายคำพูด";
  if (s.includes("--") || s.includes("/*")) return "ห้ามมีคอมเมนต์ในคำสั่ง";
  if (s.includes('"')) return "ห้ามใช้ชื่อในเครื่องหมายคำพูดคู่";
  const semi = s.indexOf(";");
  if (semi !== -1 && semi !== s.length - 1) return "อนุญาตคำสั่งเดียวเท่านั้น (พบ ; กลางคำสั่ง)";
  if (!/^select\b/i.test(s)) return "ต้องขึ้นต้นด้วย SELECT เท่านั้น";
  return null;
}

export function checkKeywords(sql: string): string | null {
  const s = stripLiterals(sql).toLowerCase();
  for (const word of FORBIDDEN) {
    if (new RegExp(`\\b${word}\\b`).test(s)) return `ห้ามใช้คำสั่ง/ฟังก์ชัน ${word.toUpperCase()}`;
  }
  return null;
}

export function checkTables(sql: string, allowedTables: string[]): string | null {
  const s = stripLiterals(sql).toLowerCase();
  const allowed = new Set(allowedTables.map((t) => t.toLowerCase()));
  for (const m of s.matchAll(/\b(?:from|join)\s+([a-z_][\w.]*)\s*(\()?/g)) {
    if (m[2]) return `ห้ามเรียกฟังก์ชันใน FROM/JOIN (${m[1]})`;
    if (!allowed.has(m[1])) return `ไม่อนุญาตให้อ่านตาราง ${m[1]} (อนุญาต: ${[...allowed].join(", ")})`;
  }
  if (/\bfrom\s+[\w.]+(?:\s+(?:as\s+)?\w+)?\s*,/.test(s)) return "ห้ามคั่นหลายตารางด้วยจุลภาคใน FROM ให้ใช้ JOIN";
  return null;
}

export function applyLimit(sql: string, maxRows: number): string {
  const q = sql.trim().replace(/;\s*$/, "").trim();
  const m = q.match(/\blimit\s+(\d+)\s*$/i);
  if (!m) return `${q} LIMIT ${maxRows}`;
  return q.replace(/\blimit\s+(\d+)\s*$/i, `LIMIT ${Math.min(Number(m[1]), maxRows)}`);
}

export function validateSql(sql: string, options: Options): Validation {
  const reason = checkStatement(sql) ?? checkKeywords(sql) ?? checkTables(sql, options.allowedTables);
  if (reason) return { ok: false, reason };
  return { ok: true, sql: applyLimit(sql, options.maxRows) };
}

export async function runReadOnly(db: Db, sql: string, timeoutMs: number): Promise<Record<string, unknown>[]> {
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) throw new Error("timeout ต้องเป็นจำนวนเต็มบวก");
  await db.query("BEGIN READ ONLY");
  try {
    await db.query(`SET LOCAL statement_timeout = ${timeoutMs}`);
    return (await db.query(sql)).rows;
  } finally {
    await db.query("ROLLBACK");
  }
}
