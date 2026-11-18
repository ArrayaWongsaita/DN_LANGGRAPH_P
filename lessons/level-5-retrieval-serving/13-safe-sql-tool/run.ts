import pg from "pg";
import { runReadOnly, validateSql } from "./sqlGuard";

// ต้องเปิด Docker (docker compose up -d --wait) และตั้ง DATABASE_URL ใน .env
try {
  process.loadEnvFile();
} catch {
  // ไม่มีไฟล์ .env ก็ไม่เป็นไร
}
if (!process.env.DATABASE_URL) {
  console.log("ยังไม่ได้ตั้ง DATABASE_URL ใน .env (ดู .env.example)");
  process.exit(0);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const options = { allowedTables: ["demo_customers", "demo_orders"], maxRows: 3 };

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
    for (const sql of [
      "SELECT city, count(*) FROM demo_customers GROUP BY city ORDER BY 2 DESC",
      "SELECT * FROM demo_customers",
      "SELECT * FROM demo_secrets",
      "DELETE FROM demo_customers",
      "SELECT 1; DROP TABLE demo_customers",
    ]) {
      const v = validateSql(sql, options);
      console.log(`\n> ${sql}`);
      if (!v.ok) {
        console.log("  ปฏิเสธชั้น 1:", v.reason);
        continue;
      }
      console.log("  ส่งจริง:", v.sql);
      console.log("  ได้", (await runReadOnly(client, v.sql, 3000)).length, "แถว");
    }

    console.log("\n--- ข้ามชั้น 1 (จำลองว่าตัวตรวจพลาด) แล้วดูชั้น 2 ---");
    try {
      await runReadOnly(client, "DELETE FROM demo_customers", 3000);
    } catch (error) {
      console.log("ฐานข้อมูลปฏิเสธ:", (error as Error).message);
    }
    try {
      await runReadOnly(client, "SELECT pg_sleep(5)", 300);
    } catch (error) {
      console.log("ตัดด้วย timeout:", (error as Error).message);
    }
    console.log("ลูกค้ายังอยู่ครบ:", (await pool.query("SELECT count(*) FROM demo_customers")).rows[0].count, "แถว");
  } finally {
    client.release();
  }
} finally {
  await pool.query("DROP TABLE IF EXISTS demo_orders; DROP TABLE IF EXISTS demo_customers; DROP TABLE IF EXISTS demo_secrets");
  await pool.end();
}
