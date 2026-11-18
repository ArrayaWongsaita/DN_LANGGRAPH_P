import { type Db, applyLimit, checkKeywords, checkStatement, checkTables, runReadOnly, validateSql } from "./sqlGuard";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ไม่ใช้ฐานข้อมูลจริง
const opts = { allowedTables: ["customers", "orders"], maxRows: 50 };
const ok = (sql: string) => validateSql(sql, opts);

test("คำสั่งปกติผ่าน และได้ LIMIT ต่อท้าย", () => {
  expect(ok("SELECT id, name FROM customers")).toEqual({ ok: true, sql: "SELECT id, name FROM customers LIMIT 50" });
  expect(ok("select o.id from orders o join customers c on c.id = o.customer_id;")).toMatchObject({ ok: true });
});

test("ต้องเป็น SELECT เท่านั้น", () => {
  for (const sql of ["", "   ", "DELETE FROM customers", "UPDATE customers SET name='x'", "WITH x AS (select 1) select * from x", "EXPLAIN select 1"]) {
    expect(ok(sql)).toMatchObject({ ok: false });
  }
  expect(checkStatement("DROP TABLE customers")).toContain("SELECT");
});

test("หลายคำสั่งและคอมเมนต์และชื่อในเครื่องหมายคำพูดคู่ถูกปฏิเสธ", () => {
  expect(ok("select 1 from customers; drop table customers")).toMatchObject({ ok: false });
  expect(ok("select 1 from customers; select 2 from customers")).toMatchObject({ ok: false });
  expect(ok("select 1 from customers -- ตามด้วยอะไรก็ได้")).toMatchObject({ ok: false });
  expect(ok("select 1 /* x */ from customers")).toMatchObject({ ok: false });
  expect(ok('select * from "Customers"')).toMatchObject({ ok: false });
});

test("เนื้อใน string literal ไม่ถูกตีความเป็นคำสั่ง/คอมเมนต์/เซมิโคลอน", () => {
  expect(ok("select * from customers where name = 'drop; delete -- /* x'")).toMatchObject({ ok: true });
  expect(ok("select * from customers where name = 'it''s; drop'")).toMatchObject({ ok: true });
});

test("string ไม่ปิดถูกปฏิเสธ", () => {
  expect(ok("select * from customers where name = 'abc")).toMatchObject({ ok: false });
});

test("คำต้องห้ามเป็นคำเต็มเท่านั้น: ชื่อคอลัมน์ที่มีคำนั้นเป็นส่วนหนึ่งไม่โดน", () => {
  expect(checkKeywords("select updated_at, dropdown, settings from customers")).toBeNull();
  expect(checkKeywords("select * into backup from customers")).toContain("INTO");
  expect(checkKeywords("select pg_sleep(10)")).toContain("PG_SLEEP");
  expect(checkKeywords("SELECT 1 WHERE EXISTS (DELETE FROM x)")).toContain("DELETE");
});

test("อ่านได้เฉพาะตารางที่อนุญาต (รวม JOIN และ subquery) ไม่สนตัวพิมพ์", () => {
  expect(ok("select * from secrets")).toMatchObject({ ok: false });
  expect(ok("select * from customers c join secrets s on s.id = c.id")).toMatchObject({ ok: false });
  expect(ok("select * from customers where id in (select id from secrets)")).toMatchObject({ ok: false });
  expect(ok("select * from pg_catalog.pg_tables")).toMatchObject({ ok: false });
  expect(ok("select * from information_schema.tables")).toMatchObject({ ok: false });
  expect(ok("SELECT * FROM CUSTOMERS")).toMatchObject({ ok: true });
  expect(checkTables("select * from secrets", ["customers"])).toContain("secrets");
});

test("เรียกฟังก์ชันใน FROM ปฏิเสธ", () => {
  expect(ok("select * from generate_series(1, 1000000)")).toMatchObject({ ok: false });
});

test("คั่นหลายตารางด้วยจุลภาคปฏิเสธ (กันหลบการตรวจตารางที่สอง)", () => {
  expect(ok("select * from customers, secrets")).toMatchObject({ ok: false });
  expect(ok("select * from customers c, orders o")).toMatchObject({ ok: false });
  expect(ok("select * from customers where id in (1, 2)")).toMatchObject({ ok: true });
});

test("applyLimit: เติม/ลด LIMIT ไม่เกินเพดาน และตัด ; ท้าย", () => {
  expect(applyLimit("select 1 from customers;", 50)).toBe("select 1 from customers LIMIT 50");
  expect(applyLimit("select 1 from customers limit 10", 50)).toBe("select 1 from customers LIMIT 10");
  expect(applyLimit("select 1 from customers LIMIT 5000;", 50)).toBe("select 1 from customers LIMIT 50");
  expect(applyLimit("  select 1 from customers  ", 50)).toBe("select 1 from customers LIMIT 50");
});

class FakeDb implements Db {
  log: string[] = [];
  fail = false;
  async query(sql: string) {
    this.log.push(sql);
    if (this.fail && sql.startsWith("select")) throw new Error("คิวรีล้ม");
    return { rows: sql.startsWith("select") ? [{ id: 1 }] : [] };
  }
}

test("runReadOnly: BEGIN READ ONLY → SET LOCAL timeout → คิวรี → ROLLBACK", async () => {
  const db = new FakeDb();
  expect(await runReadOnly(db, "select 1", 3000)).toEqual([{ id: 1 }]);
  expect(db.log).toEqual(["BEGIN READ ONLY", "SET LOCAL statement_timeout = 3000", "select 1", "ROLLBACK"]);
});

test("runReadOnly: คิวรีล้มก็ยัง ROLLBACK และโยน error เดิม", async () => {
  const db = new FakeDb();
  db.fail = true;
  await expect(runReadOnly(db, "select 1", 1000)).rejects.toThrow("คิวรีล้ม");
  expect(db.log.at(-1)).toBe("ROLLBACK");
  expect(db.log).not.toContain("COMMIT");
});

test("runReadOnly: timeout ที่ไม่ใช่จำนวนเต็มบวกถูกปฏิเสธก่อนแตะฐานข้อมูล (กันฉีดผ่าน SET)", async () => {
  const db = new FakeDb();
  for (const bad of [0, -5, 1.5, Number.NaN, "1; drop table x" as unknown as number]) {
    await expect(runReadOnly(db, "select 1", bad)).rejects.toThrow("timeout");
  }
  expect(db.log).toEqual([]);
});
