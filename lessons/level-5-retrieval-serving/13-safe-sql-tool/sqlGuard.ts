import pg from "pg";
import { todo } from "@src/todo";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-13  (ต้องเปิดฐานข้อมูล docker compose up -d --wait และมี DATABASE_URL ใน .env ไม่ใช้ LLM)
// เครื่องมือ SQL ที่ปลอดภัยพอให้ agent ใช้: ป้องกันสองชั้น ชั้น 1 ตรวจข้อความคำสั่ง (SELECT เดียว, ไม่มีคำต้องห้าม, ตารางที่อนุญาต, LIMIT) ชั้น 2 รันในธุรกรรมอ่านอย่างเดียวพร้อม timeout เผื่อชั้น 1 พลาด
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.log("ยังไม่ได้ตั้ง DATABASE_URL ใน .env (ดู .env.example)");
  process.exit(1);
}

interface Db {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

interface Options {
  allowedTables: string[];
  maxRows: number;
}

type Validation = { ok: true; sql: string } | { ok: false; reason: string };

// ตัดเนื้อใน string literal ('...' รองรับ '' ที่หมายถึงเครื่องหมายคำพูดหนึ่งตัว) ให้เหลือเป็น ? ไว้ตรวจโครงสร้างคำสั่ง
function stripLiterals(sql: string): string {
  return sql.replace(/'(?:[^']|'')*'/g, "?");
}

const FORBIDDEN = [
  "insert", "update", "delete", "drop", "alter", "create", "grant", "revoke", "truncate", "copy", "call", "do",
  "set", "reset", "into", "execute", "vacuum", "lock", "listen", "notify", "pg_sleep", "pg_read_file",
];

// คืนเหตุผลที่ปฏิเสธ หรือ null ถ้าผ่าน
function checkStatement(sql: string): string | null {
  // 👉 ข้อ 1: ให้ s = stripLiterals(sql).trim() แล้วตรวจตามลำดับ (คืนข้อความไทยที่อธิบายได้ข้อใดข้อหนึ่ง):
  //   - ว่างเปล่า
  //   - เหลือเครื่องหมาย ' ใน s (string ไม่ปิด)
  //   - มี "--" หรือ "/*" (คอมเมนต์) หรือ " (ชื่อในเครื่องหมายคำพูดคู่)
  //   - มี ";" ที่ไม่ใช่ตัวสุดท้ายของ s (หลายคำสั่ง)
  //   - ไม่ได้ขึ้นต้นด้วย select (ไม่สนตัวพิมพ์) เช่น /^select\b/i (ข้อความต้องมีคำว่า SELECT)
  //   ผ่านทุกข้อคืน null
  return todo(1);
}

function checkKeywords(sql: string): string | null {
  // 👉 ข้อ 2: s = stripLiterals(sql).toLowerCase() ถ้ามีคำใน FORBIDDEN ปรากฏเป็น "คำเต็ม" (ขอบคำ \b) ให้คืนข้อความที่บอกคำนั้น (เป็นตัวพิมพ์ใหญ่ เช่น INTO) ไม่งั้น null
  return todo(2);
}

function checkTables(sql: string, allowedTables: string[]): string | null {
  // 👉 ข้อ 3: s = stripLiterals(sql).toLowerCase(); วนหา /\b(?:from|join)\s+([a-z_][\w.]*)\s*(\()?/g
  //   - ถ้ามี "(" ต่อท้ายชื่อ (เรียกฟังก์ชัน) → คืนเหตุผล
  //   - ถ้าชื่อไม่อยู่ใน allowedTables (เทียบตัวพิมพ์เล็ก) → คืนเหตุผลที่บอกชื่อตาราง (ชื่อมีจุด เช่น pg_catalog.x ก็ไม่อยู่ในรายการ)
  //   - นอกจากนี้ ถ้าตรงกับ /\bfrom\s+[\w.]+(?:\s+(?:as\s+)?\w+)?\s*,/ (คั่นหลายตารางด้วยจุลภาค) → คืนเหตุผลให้ใช้ JOIN
  //   ผ่านหมดคืน null
  return todo(3);
}

// ตัด ; ท้าย แล้วให้มี LIMIT ที่ไม่เกิน maxRows
function applyLimit(sql: string, maxRows: number): string {
  // 👉 ข้อ 4: q = sql.trim() ตัด ";" ท้ายออก; ถ้าท้ายคำสั่งเป็น /\blimit\s+(\d+)\s*$/i
  //          ให้แทนเลขด้วย min(เลขเดิม, maxRows) (เขียน LIMIT ตัวใหญ่) ไม่มีก็ต่อท้าย ` LIMIT ${maxRows}` แล้วคืน q
  return todo(4);
}

function validateSql(sql: string, options: Options): Validation {
  const reason = checkStatement(sql) ?? checkKeywords(sql) ?? checkTables(sql, options.allowedTables);
  if (reason) return { ok: false, reason };
  return { ok: true, sql: applyLimit(sql, options.maxRows) };
}

// รันในธุรกรรมอ่านอย่างเดียวพร้อม timeout (ชั้นที่ 2) ต้องใช้ client ตัวเดียว (pool.connect())
async function runReadOnly(db: Db, sql: string, timeoutMs: number): Promise<Record<string, unknown>[]> {
  // 👉 ข้อ 5: ถ้า timeoutMs ไม่ใช่จำนวนเต็มบวก throw new Error("timeout ต้องเป็นจำนวนเต็มบวก") ก่อนแตะฐานข้อมูล
  //   ลำดับ: db.query("BEGIN READ ONLY"); db.query(`SET LOCAL statement_timeout = ${timeoutMs}`) (SET ใช้พารามิเตอร์ไม่ได้ จึงต้องตรวจเลขก่อน);
  //   rows = (await db.query(sql)).rows; คืน rows
  //   ไม่ว่าสำเร็จหรือล้ม ต้องจบด้วย db.query("ROLLBACK") เสมอ (ไม่ COMMIT: ไม่มีอะไรให้บันทึก)
  return todo(5);
}

const opts: Options = { allowedTables: ["customers", "orders"], maxRows: 50 };
const v = (sql: string) => validateSql(sql, opts);
const rejected = (sql: string) => !v(sql).ok;
const accepted = (sql: string) => v(sql).ok;

class FakeDb implements Db {
  log: string[] = [];
  fail = false;
  async query(sql: string) {
    this.log.push(sql);
    if (this.fail && sql.startsWith("select")) throw new Error("คิวรีล้ม");
    return { rows: sql.startsWith("select") ? [{ id: 1 }] : [] };
  }
}
const rejectsMsg = async (p: Promise<unknown>): Promise<string> => {
  try {
    await p;
    return "";
  } catch (e) {
    return (e as Error).message;
  }
};
const dbOk = new FakeDb();
const rowsOk = await runReadOnly(dbOk, "select 1", 3000);
const dbFail = new FakeDb();
dbFail.fail = true;
const failMsg = await rejectsMsg(runReadOnly(dbFail, "select 1", 1000));
const dbBad = new FakeDb();
const badMsgs: string[] = [];
for (const bad of [0, -5, 1.5, Number.NaN, "1; drop table x" as unknown as number]) badMsgs.push(await rejectsMsg(runReadOnly(dbBad, "select 1", bad)));

// ของจริง: ตารางทดลองใน Postgres ของคอร์ส
const pool = new pg.Pool({ connectionString: url });
const real: Options = { allowedTables: ["demo_customers", "demo_orders"], maxRows: 3 };
let realRows = 0;
let realLeak = "";
let deleteMsg = "";
let sleepMsg = "";
let remaining = "";
try {
  await pool.query("DROP TABLE IF EXISTS demo_orders; DROP TABLE IF EXISTS demo_customers; DROP TABLE IF EXISTS demo_secrets");
  await pool.query(`CREATE TABLE demo_customers (id int PRIMARY KEY, name text, city text);
    CREATE TABLE demo_orders (id int PRIMARY KEY, customer_id int REFERENCES demo_customers(id), total numeric);
    CREATE TABLE demo_secrets (id int, token text);
    INSERT INTO demo_customers VALUES (1,'สมชาย','เชียงใหม่'),(2,'สมหญิง','กรุงเทพ'),(3,'มานี','ภูเก็ต'),(4,'ปิติ','ขอนแก่น'),(5,'ชูใจ','กรุงเทพ');
    INSERT INTO demo_orders VALUES (1,1,500),(2,2,1200),(3,2,300),(4,3,99);
    INSERT INTO demo_secrets VALUES (1,'TOKEN-ลับ')`);
  const client = await pool.connect();
  try {
    const good = validateSql("SELECT * FROM demo_customers", real);
    if (good.ok) realRows = (await runReadOnly(client, good.sql, 3000)).length;
    const leak = validateSql("SELECT * FROM demo_secrets", real);
    realLeak = leak.ok ? "ผ่าน!" : leak.reason;
    // ข้ามชั้น 1 (จำลองว่าตัวตรวจพลาด) แล้วดูชั้น 2
    deleteMsg = await rejectsMsg(runReadOnly(client, "DELETE FROM demo_customers", 3000));
    sleepMsg = await rejectsMsg(runReadOnly(client, "SELECT pg_sleep(5)", 300));
    remaining = String((await pool.query("SELECT count(*) FROM demo_customers")).rows[0].count);
  } finally {
    client.release();
  }
  console.log({ realRows, realLeak, deleteMsg, sleepMsg, remaining });
} finally {
  await pool.query("DROP TABLE IF EXISTS demo_orders; DROP TABLE IF EXISTS demo_customers; DROP TABLE IF EXISTS demo_secrets");
  await pool.end();
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const normal = v("SELECT id, name FROM customers");
check("คำสั่งปกติผ่าน และได้ LIMIT ต่อท้าย", normal.ok && normal.sql === "SELECT id, name FROM customers LIMIT 50" && accepted("select o.id from orders o join customers c on c.id = o.customer_id;"));
check("ต้องเป็น SELECT เท่านั้น", ["", "   ", "DELETE FROM customers", "UPDATE customers SET name='x'", "WITH x AS (select 1) select * from x", "EXPLAIN select 1"].every(rejected) && (checkStatement("DROP TABLE customers") ?? "").includes("SELECT"));
check("หลายคำสั่ง คอมเมนต์ และชื่อในเครื่องหมายคำพูดคู่ถูกปฏิเสธ", ["select 1 from customers; drop table customers", "select 1 from customers; select 2 from customers", "select 1 from customers -- ตามด้วยอะไรก็ได้", "select 1 /* x */ from customers", 'select * from "Customers"'].every(rejected));
check("เนื้อใน string literal ไม่ถูกตีความเป็นคำสั่ง/คอมเมนต์/เซมิโคลอน", accepted("select * from customers where name = 'drop; delete -- /* x'") && accepted("select * from customers where name = 'it''s; drop'"), "ใช้ stripLiterals ก่อนตรวจ");
check("string ไม่ปิดถูกปฏิเสธ", rejected("select * from customers where name = 'abc"));
check("คำต้องห้ามเป็นคำเต็มเท่านั้น: ชื่อคอลัมน์ที่มีคำนั้นเป็นส่วนหนึ่งไม่โดน", checkKeywords("select updated_at, dropdown, settings from customers") === null && (checkKeywords("select * into backup from customers") ?? "").includes("INTO") && (checkKeywords("select pg_sleep(10)") ?? "").includes("PG_SLEEP") && (checkKeywords("SELECT 1 WHERE EXISTS (DELETE FROM x)") ?? "").includes("DELETE"));
check("อ่านได้เฉพาะตารางที่อนุญาต (รวม JOIN และ subquery) ไม่สนตัวพิมพ์", ["select * from secrets", "select * from customers c join secrets s on s.id = c.id", "select * from customers where id in (select id from secrets)", "select * from pg_catalog.pg_tables", "select * from information_schema.tables"].every(rejected) && accepted("SELECT * FROM CUSTOMERS") && (checkTables("select * from secrets", ["customers"]) ?? "").includes("secrets"));
check("เรียกฟังก์ชันใน FROM ปฏิเสธ", rejected("select * from generate_series(1, 1000000)"));
check("คั่นหลายตารางด้วยจุลภาคปฏิเสธ (กันหลบการตรวจตารางที่สอง)", rejected("select * from customers, secrets") && rejected("select * from customers c, orders o") && accepted("select * from customers where id in (1, 2)"));
check("applyLimit: เติม/ลด LIMIT ไม่เกินเพดาน และตัด ; ท้าย", applyLimit("select 1 from customers;", 50) === "select 1 from customers LIMIT 50" && applyLimit("select 1 from customers limit 10", 50) === "select 1 from customers LIMIT 10" && applyLimit("select 1 from customers LIMIT 5000;", 50) === "select 1 from customers LIMIT 50" && applyLimit("  select 1 from customers  ", 50) === "select 1 from customers LIMIT 50");
check("runReadOnly: BEGIN READ ONLY → SET LOCAL timeout → คิวรี → ROLLBACK", JSON.stringify(rowsOk) === '[{"id":1}]' && JSON.stringify(dbOk.log) === JSON.stringify(["BEGIN READ ONLY", "SET LOCAL statement_timeout = 3000", "select 1", "ROLLBACK"]));
check("runReadOnly: คิวรีล้มก็ยัง ROLLBACK และโยน error เดิม", failMsg === "คิวรีล้ม" && dbFail.log.at(-1) === "ROLLBACK" && !dbFail.log.includes("COMMIT"));
check("runReadOnly: timeout ที่ไม่ใช่จำนวนเต็มบวกถูกปฏิเสธก่อนแตะฐานข้อมูล (กันฉีดผ่าน SET)", badMsgs.every((m) => m.includes("timeout")) && dbBad.log.length === 0);
check("Postgres จริง: SELECT ปกติได้เพดาน 3 แถว ตารางลับถูกปฏิเสธ", realRows === 3 && realLeak.includes("demo_secrets"), "ตรวจ docker compose และ DATABASE_URL");
check("Postgres จริง: ชั้น 2 กัน DELETE และตัด pg_sleep ด้วย timeout ข้อมูลยังอยู่ครบ", deleteMsg.length > 0 && sleepMsg.length > 0 && remaining === "5");
