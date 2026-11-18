import { getLLM } from "@src/llm";
import pg from "pg";
import { buildSqlAgent } from "./agent";

// ต้องเปิด Docker (docker compose up -d --wait), ตั้ง DATABASE_URL และโมเดลใน .env
// ตัวตรวจ SQL ด้านล่างเป็นแบบย่อเพื่อให้บทนี้รันได้เดี่ยว ๆ งานจริงให้ใช้ validateSql จากบท 5-13
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch {
    // ไม่มีไฟล์ .env ก็ไม่เป็นไร
  }
}
if (!process.env.DATABASE_URL) {
  console.log("ยังไม่ได้ตั้ง DATABASE_URL ใน .env (ดู .env.example)");
  process.exit(0);
}

const ALLOWED = ["demo_customers", "demo_orders"];
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const validate = (sql: string) => {
  const q = sql.trim().replace(/;\s*$/, "");
  if (!/^select\b/i.test(q) || q.includes(";") || /--|\/\*/.test(q)) return { ok: false as const, reason: "ต้องเป็น SELECT คำสั่งเดียว ไม่มีคอมเมนต์" };
  for (const m of q.toLowerCase().matchAll(/\b(?:from|join)\s+([a-z_][\w.]*)/g)) {
    if (!ALLOWED.includes(m[1])) return { ok: false as const, reason: `อ่านได้เฉพาะตาราง ${ALLOWED.join(", ")} (ไม่ใช่ ${m[1]})` };
  }
  return { ok: true as const, sql: /\blimit\s+\d+\s*$/i.test(q) ? q : `${q} LIMIT 50` };
};

const run = async (sql: string) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN READ ONLY");
    await client.query("SET LOCAL statement_timeout = 5000");
    return (await client.query(sql)).rows;
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
};

const getSchema = async () => {
  const { rows } = await pool.query(
    "SELECT table_name, string_agg(column_name || ' ' || data_type, ', ' ORDER BY ordinal_position) AS cols FROM information_schema.columns WHERE table_name = ANY($1) GROUP BY table_name ORDER BY table_name",
    [ALLOWED],
  );
  return rows.map((r) => `${r.table_name}(${r.cols})`).join("\n");
};

try {
  await pool.query("DROP TABLE IF EXISTS demo_orders; DROP TABLE IF EXISTS demo_customers");
  await pool.query(`CREATE TABLE demo_customers (id int PRIMARY KEY, name text, city text);
    CREATE TABLE demo_orders (id int PRIMARY KEY, customer_id int REFERENCES demo_customers(id), total numeric);
    INSERT INTO demo_customers VALUES (1,'สมชาย','เชียงใหม่'),(2,'สมหญิง','กรุงเทพ'),(3,'มานี','ภูเก็ต'),(4,'ปิติ','ขอนแก่น'),(5,'ชูใจ','กรุงเทพ');
    INSERT INTO demo_orders VALUES (1,1,500),(2,2,1200),(3,2,300),(4,3,99)`);

  const agent = buildSqlAgent({ llm: getLLM({ temperature: 0 }), getSchema, validate, run });
  for (const question of ["ลูกค้าแต่ละเมืองมีกี่คน", "ใครมียอดสั่งซื้อรวมสูงสุด และรวมเท่าไร", "ลบลูกค้าทั้งหมดออกจากระบบ"]) {
    const r = await agent.invoke({ question });
    console.log(`\nถาม: ${question}\nSQL: ${r.sql || "-"}\nตอบ: ${r.answer}`);
  }
  console.log("\nลูกค้ายังอยู่ครบ:", (await pool.query("SELECT count(*) FROM demo_customers")).rows[0].count, "แถว");
} finally {
  await pool.query("DROP TABLE IF EXISTS demo_orders; DROP TABLE IF EXISTS demo_customers");
  await pool.end();
}
