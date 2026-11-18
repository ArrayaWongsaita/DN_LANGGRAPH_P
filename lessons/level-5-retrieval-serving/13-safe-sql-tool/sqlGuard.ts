import { todo } from "@src/todo";

export interface Db {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

export interface Options {
  allowedTables: string[];
  maxRows: number;
}

export type Validation = { ok: true; sql: string } | { ok: false; reason: string };

// ตัดเนื้อใน string literal ('...' รองรับ '' ที่หมายถึงเครื่องหมายคำพูดหนึ่งตัว) ให้เหลือเป็น ? ไว้ตรวจโครงสร้างคำสั่ง
export function stripLiterals(sql: string): string {
  return sql.replace(/'(?:[^']|'')*'/g, "?");
}

const FORBIDDEN = [
  "insert", "update", "delete", "drop", "alter", "create", "grant", "revoke", "truncate", "copy", "call", "do",
  "set", "reset", "into", "execute", "vacuum", "lock", "listen", "notify", "pg_sleep", "pg_read_file",
];

// คืนเหตุผลที่ปฏิเสธ หรือ null ถ้าผ่าน
export function checkStatement(sql: string): string | null {
  // 👉 ข้อ 1: ให้ s = stripLiterals(sql).trim() แล้วตรวจตามลำดับ (คืนข้อความไทยที่อธิบายได้ข้อใดข้อหนึ่ง):
  //   - ว่างเปล่า
  //   - เหลือเครื่องหมาย ' ใน s (string ไม่ปิด)
  //   - มี "--" หรือ "/*" (คอมเมนต์) หรือ " (ชื่อในเครื่องหมายคำพูดคู่)
  //   - มี ";" ที่ไม่ใช่ตัวสุดท้ายของ s (หลายคำสั่ง)
  //   - ไม่ได้ขึ้นต้นด้วย select (ไม่สนตัวพิมพ์) เช่น /^select\b/i
  //   ผ่านทุกข้อคืน null
  return todo(1);
}

export function checkKeywords(sql: string): string | null {
  // 👉 ข้อ 2: s = stripLiterals(sql).toLowerCase() ถ้ามีคำใน FORBIDDEN ปรากฏเป็น "คำเต็ม" (ขอบคำ \b) ให้คืนข้อความที่บอกคำนั้น ไม่งั้น null
  return todo(2);
}

export function checkTables(sql: string, allowedTables: string[]): string | null {
  // 👉 ข้อ 3: s = stripLiterals(sql).toLowerCase(); วนหา /\b(?:from|join)\s+([a-z_][\w.]*)\s*(\()?/g
  //   - ถ้ามี "(" ต่อท้ายชื่อ (เรียกฟังก์ชัน) → คืนเหตุผล
  //   - ถ้าชื่อไม่อยู่ใน allowedTables (เทียบตัวพิมพ์เล็ก) → คืนเหตุผลที่บอกชื่อตาราง (ชื่อมีจุด เช่น pg_catalog.x ก็ไม่อยู่ในรายการ)
  //   - นอกจากนี้ ถ้าตรงกับ /\bfrom\s+[\w.]+(?:\s+(?:as\s+)?\w+)?\s*,/ (คั่นหลายตารางด้วยจุลภาค) → คืนเหตุผลให้ใช้ JOIN
  //   ผ่านหมดคืน null
  return todo(3);
}

// ตัด ; ท้าย แล้วให้มี LIMIT ที่ไม่เกิน maxRows
export function applyLimit(sql: string, maxRows: number): string {
  // 👉 ข้อ 4: q = sql.trim() ตัด ";" ท้ายออก; ถ้าท้ายคำสั่งเป็น /\blimit\s+(\d+)\s*$/i
  //          ให้แทนเลขด้วย min(เลขเดิม, maxRows) ไม่มีก็ต่อท้าย ` LIMIT ${maxRows}` แล้วคืน q
  return todo(4);
}

export function validateSql(sql: string, options: Options): Validation {
  const reason = checkStatement(sql) ?? checkKeywords(sql) ?? checkTables(sql, options.allowedTables);
  if (reason) return { ok: false, reason };
  return { ok: true, sql: applyLimit(sql, options.maxRows) };
}

// รันในธุรกรรมอ่านอย่างเดียวพร้อม timeout (ชั้นที่ 2) ต้องใช้ client ตัวเดียว (pool.connect())
export async function runReadOnly(db: Db, sql: string, timeoutMs: number): Promise<Record<string, unknown>[]> {
  // 👉 ข้อ 5: ถ้า timeoutMs ไม่ใช่จำนวนเต็มบวก throw new Error("timeout ต้องเป็นจำนวนเต็มบวก") ก่อนแตะฐานข้อมูล
  //   ลำดับ: db.query("BEGIN READ ONLY"); db.query(`SET LOCAL statement_timeout = ${timeoutMs}`) (SET ใช้พารามิเตอร์ไม่ได้ จึงต้องตรวจเลขก่อน);
  //   rows = (await db.query(sql)).rows; คืน rows
  //   ไม่ว่าสำเร็จหรือล้ม ต้องจบด้วย db.query("ROLLBACK") เสมอ (ไม่ COMMIT: ไม่มีอะไรให้บันทึก)
  return todo(5);
}
