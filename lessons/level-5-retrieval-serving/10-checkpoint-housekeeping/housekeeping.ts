import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import pg from "pg";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-10  (ต้องเปิดฐานข้อมูล docker compose up -d --wait และมี DATABASE_URL ใน .env ไม่ใช้ LLM)
// checkpoint บน Postgres โตไม่หยุด: ทุกขั้นของทุก thread ถูกเก็บ งานบ้านที่ต้องทำคือเก็บเฉพาะ checkpoint ใหม่ ๆ ลบของเก่า (พร้อม writes) แล้วกวาด blob ที่ไม่มีใครอ้างถึง ทั้งหมดในธุรกรรมเดียว (ล้มกลางทางต้อง ROLLBACK ไม่ปล่อยให้ข้อมูลครึ่ง ๆ กลาง ๆ)
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

// client ของ pg (Pool หรือ PoolClient) ใช้แทนได้ ธุรกรรมต้องใช้ client ตัวเดียว (pool.connect())
interface Db {
  query(sql: string, params?: unknown[]): Promise<{ rows: any[] }>;
}

const SQL = {
  listCheckpoints:
    "SELECT checkpoint_ns AS ns, checkpoint_id AS id, checkpoint->'channel_versions' AS channel_versions FROM checkpoints WHERE thread_id = $1 ORDER BY checkpoint_id DESC",
  listBlobs: "SELECT checkpoint_ns AS ns, channel, version FROM checkpoint_blobs WHERE thread_id = $1",
  deleteCheckpoints: "DELETE FROM checkpoints WHERE thread_id = $1 AND checkpoint_id = ANY($2::text[])",
  deleteWrites: "DELETE FROM checkpoint_writes WHERE thread_id = $1 AND checkpoint_id = ANY($2::text[])",
  deleteBlobs:
    "DELETE FROM checkpoint_blobs WHERE thread_id = $1 AND (checkpoint_ns, channel, version) IN (SELECT * FROM unnest($2::text[], $3::text[], $4::text[]))",
} as const;

interface CheckpointRow {
  ns: string;
  id: string;
}

interface BlobRow {
  ns: string;
  channel: string;
  version: string;
}

// คืน checkpoint ที่ "ควรลบ": เก็บ id ใหม่สุด `keep` อันต่อ namespace (id เรียงตามตัวอักษร = เรียงตามเวลา)
function planPrune(rows: CheckpointRow[], keep: number): CheckpointRow[] {
  if (keep < 1) throw new Error("ต้องเก็บอย่างน้อย 1 checkpoint");
  const byNs = new Map<string, CheckpointRow[]>();
  for (const row of rows) byNs.set(row.ns, [...(byNs.get(row.ns) ?? []), row]);
  const doomed: CheckpointRow[] = [];
  for (const group of byNs.values()) {
    const sorted = [...group].sort((a, b) => (a.id < b.id ? 1 : -1));
    doomed.push(...sorted.slice(keep));
  }
  return doomed;
}

// blob ที่ไม่มี checkpoint ที่เหลืออยู่อ้างถึง: checkpoint อ้าง blob เมื่อ channel_versions[channel] เท่ากับ version (เทียบเป็นสตริง) ใน ns เดียวกัน
function findOrphanBlobs(blobs: BlobRow[], kept: { ns: string; channel_versions: Record<string, string | number> }[]): BlobRow[] {
  // 👉 ข้อ 1 สร้างเซตของ `${ns}|${channel}|${version}` จาก kept แล้วคืน blob ที่ไม่อยู่ในเซตนั้น
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   const used = new Set<string>();
  //   for (const cp of kept) for (const [channel, version] of Object.entries(cp.channel_versions)) used.add(`${cp.ns}|${channel}|${version}`);
  //   return blobs.filter((b) => !used.has(`${b.ns}|${b.channel}|${b.version}`));
  return todo(1);
}

// ลบ checkpoint เก่าของ thread ในธุรกรรมเดียว คืนจำนวนที่ลบ
async function pruneThread(db: Db, threadId: string, keep: number): Promise<{ checkpoints: number; blobs: number }> {
  planPrune([], keep); // ตรวจ keep ก่อนแตะฐานข้อมูล
  await db.query("BEGIN");
  try {
    const rows = (await db.query(SQL.listCheckpoints, [threadId])).rows as (CheckpointRow & { channel_versions: Record<string, string | number> })[];
    const doomed = planPrune(rows, keep);
    if (doomed.length === 0) {
      await db.query("COMMIT");
      return { checkpoints: 0, blobs: 0 };
    }
    const ids = doomed.map((d) => d.id);
    await db.query(SQL.deleteWrites, [threadId, ids]);
    await db.query(SQL.deleteCheckpoints, [threadId, ids]);
    const kept = rows.filter((r) => !ids.includes(r.id));
    const blobs = (await db.query(SQL.listBlobs, [threadId])).rows as BlobRow[];
    const orphans = findOrphanBlobs(blobs, kept);
    if (orphans.length > 0) {
      await db.query(SQL.deleteBlobs, [threadId, orphans.map((o) => o.ns), orphans.map((o) => o.channel), orphans.map((o) => o.version)]);
    }
    await db.query("COMMIT");
    return { checkpoints: doomed.length, blobs: orphans.length };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

// thread ที่ไม่มีความเคลื่อนไหวนานกว่า maxAgeDays วัน (เก่ากว่าเกณฑ์จริง ๆ: เท่ากับเกณฑ์ยังไม่ถือว่าเก่า)
function staleThreads(threads: { threadId: string; lastActivity: Date }[], now: Date, maxAgeDays: number): string[] {
  const limit = maxAgeDays * 24 * 60 * 60 * 1000;
  return threads.filter((t) => now.getTime() - t.lastActivity.getTime() > limit).map((t) => t.threadId);
}

// ส่วนที่ 1: ฐานข้อมูลปลอมในหน่วยความจำที่ทำงานตาม SQL ใน SQL.* และจดคำสั่งทั้งหมด
type Cp = { ns: string; id: string; channel_versions: Record<string, string> };
class FakeDb implements Db {
  log: string[] = [];
  failOn: string | null = null;
  constructor(
    public checkpoints: Cp[],
    public blobs: BlobRow[],
    public writes: string[],
  ) {}
  async query(sql: string, params: any[] = []) {
    const name = Object.entries(SQL).find(([, v]) => v === sql)?.[0] ?? sql;
    this.log.push(name);
    if (this.failOn === name) throw new Error(`ล้มที่ ${name}`);
    if (sql === SQL.listCheckpoints) return { rows: [...this.checkpoints].sort((a, b) => (a.id < b.id ? 1 : -1)) };
    if (sql === SQL.listBlobs) return { rows: [...this.blobs] };
    if (sql === SQL.deleteWrites) this.writes = this.writes.filter((w) => !params[1].includes(w));
    if (sql === SQL.deleteCheckpoints) this.checkpoints = this.checkpoints.filter((c) => !params[1].includes(c.id));
    if (sql === SQL.deleteBlobs) {
      const [, ns, ch, ver] = params as [string, string[], string[], string[]];
      this.blobs = this.blobs.filter((b) => !ns.some((n, i) => n === b.ns && ch[i] === b.channel && ver[i] === b.version));
    }
    return { rows: [] };
  }
}
// 5 checkpoint (id เรียงตามเวลา) channel "count" เปลี่ยนทุกขั้น ส่วน "name" เปลี่ยนแค่ขั้นแรก (blob ใช้ร่วม)
const fixture = () =>
  new FakeDb(
    [1, 2, 3, 4, 5].map((n) => ({ ns: "", id: `cp${n}`, channel_versions: { count: `v${n}`, name: "n1" } })),
    [...[1, 2, 3, 4, 5].map((n) => ({ ns: "", channel: "count", version: `v${n}` })), { ns: "", channel: "name", version: "n1" }],
    ["cp1", "cp2", "cp5"],
  );
const rejects = async (p: Promise<unknown>): Promise<string> => {
  try {
    await p;
    return "";
  } catch (e) {
    return (e as Error).message;
  }
};
const sync = (fn: () => void): string => {
  try {
    fn();
    return "";
  } catch (e) {
    return (e as Error).message;
  }
};

const ids = (rows: CheckpointRow[]) => rows.map((r) => r.id).sort();
const shuffled = ["cp3", "cp1", "cp5", "cp2", "cp4"].map((id) => ({ ns: "", id }));
const subRows = [
  { ns: "", id: "a1" },
  { ns: "", id: "a2" },
  { ns: "sub:1", id: "b1" },
  { ns: "sub:1", id: "b2" },
  { ns: "sub:1", id: "b3" },
];
const orphans = findOrphanBlobs(
  [
    { ns: "", channel: "count", version: "v1" },
    { ns: "", channel: "count", version: "v5" },
    { ns: "", channel: "name", version: "n1" },
    { ns: "sub", channel: "name", version: "n1" },
  ],
  [{ ns: "", channel_versions: { count: "v5", name: "n1" } }],
);
const numeric = findOrphanBlobs([{ ns: "", channel: "c", version: "3" }], [{ ns: "", channel_versions: { c: 3 } }]);
const dbOk = fixture();
const resOk = await pruneThread(dbOk, "t1", 2);
const dbFail = fixture();
dbFail.failOn = "deleteBlobs";
const failMsg = await rejects(pruneThread(dbFail, "t1", 2));
const dbIdle = fixture();
const resIdle = await pruneThread(dbIdle, "t1", 10);
const dbZero = fixture();
const zeroMsg = await rejects(pruneThread(dbZero, "t1", 0));
const now = new Date("2026-06-30T00:00:00Z");
const day = 24 * 60 * 60 * 1000;
const stale = staleThreads(
  [
    { threadId: "old", lastActivity: new Date(now.getTime() - 31 * day) },
    { threadId: "edge", lastActivity: new Date(now.getTime() - 30 * day) },
    { threadId: "new", lastActivity: new Date(now.getTime() - 1 * day) },
    { threadId: "old2", lastActivity: new Date(now.getTime() - 400 * day) },
  ],
  now,
  30,
);

// ส่วนที่ 2: Postgres จริง รัน 6 รอบสร้าง checkpoint หลายชุด แล้วลบเหลือ 2 และยังรันต่อได้
const pool = new pg.Pool({ connectionString: url });
const saver = new PostgresSaver(pool);
const thread = `demo-5-10-${Date.now()}`;
const count = async (table: string) => Number((await pool.query(`SELECT count(*) FROM ${table} WHERE thread_id = $1`, [thread])).rows[0].count);
let before = 0;
let after = 0;
let nAfterPrune = 0;
let nNext = 0;
try {
  await saver.setup();
  const State = new StateSchema({ n: z.number().default(0) });
  const app = new StateGraph(State)
    .addNode("step", (s) => ({ n: s.n + 1 }))
    .addEdge(START, "step")
    .addEdge("step", END)
    .compile({ checkpointer: saver });
  const cfg = { configurable: { thread_id: thread } };
  for (let i = 0; i < 6; i++) await app.invoke({}, cfg);
  before = await count("checkpoints");
  const client = await pool.connect(); // ธุรกรรมต้องใช้ client ตัวเดียว
  try {
    console.log("ลบ:", await pruneThread(client, thread, 2));
  } finally {
    client.release();
  }
  after = await count("checkpoints");
  console.log("checkpoints ก่อน/หลัง:", before, after, " blobs หลังลบ:", await count("checkpoint_blobs"));
  nAfterPrune = ((await app.getState(cfg)).values as { n: number }).n;
  nNext = (await app.invoke({}, cfg)).n;
} finally {
  await saver.deleteThread(thread); // ลบข้อมูลทดลองทิ้ง
  await pool.end();
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("planPrune: เก็บใหม่สุด keep อันต่อ namespace ลบที่เหลือ (ลำดับอะไรก็ได้)", JSON.stringify(ids(planPrune(shuffled, 2))) === '["cp1","cp2","cp3"]' && planPrune(shuffled, 5).length === 0 && planPrune(shuffled, 99).length === 0);
check("planPrune: แต่ละ namespace นับแยกกัน (subgraph)", JSON.stringify(ids(planPrune(subRows, 1))) === '["a1","b1","b2"]');
check("planPrune: keep < 1 ไม่อนุญาต (ไม่งั้นลบหมดทั้ง thread)", sync(() => planPrune([{ ns: "", id: "a" }], 0)).includes("ต้องเก็บอย่างน้อย 1 checkpoint"));
check("findOrphanBlobs: blob ที่ยังถูกอ้างโดย checkpoint ที่เหลือ (แม้ใช้ร่วม) ไม่ถูกนับเป็นกำพร้า", JSON.stringify(orphans) === JSON.stringify([{ ns: "", channel: "count", version: "v1" }, { ns: "sub", channel: "name", version: "n1" }]));
check("findOrphanBlobs: เวอร์ชันเป็นตัวเลขก็เทียบได้ (เทียบเป็นสตริง)", numeric.length === 0);
check("pruneThread: ลบ checkpoint เก่า, writes ของมัน และ blob กำพร้า แต่เก็บ blob ที่ใช้ร่วม", resOk.checkpoints === 3 && resOk.blobs === 3 && JSON.stringify(dbOk.checkpoints.map((c) => c.id).sort()) === '["cp4","cp5"]' && JSON.stringify(dbOk.writes) === '["cp5"]' && JSON.stringify(dbOk.blobs.map((b) => `${b.channel}:${b.version}`).sort()) === '["count:v4","count:v5","name:n1"]');
check("pruneThread: อยู่ในธุรกรรม BEGIN … COMMIT และลบ writes ก่อน checkpoints", dbOk.log[0] === "BEGIN" && dbOk.log.at(-1) === "COMMIT" && !dbOk.log.includes("ROLLBACK") && dbOk.log.indexOf("deleteWrites") < dbOk.log.indexOf("deleteCheckpoints"));
check("pruneThread: ล้มกลางทาง ROLLBACK ไม่ COMMIT และโยน error เดิม", failMsg === "ล้มที่ deleteBlobs" && dbFail.log.at(-1) === "ROLLBACK" && !dbFail.log.includes("COMMIT"));
check("pruneThread: ไม่มีอะไรต้องลบ ไม่ลบอะไร และปิดธุรกรรมเรียบร้อย", resIdle.checkpoints === 0 && resIdle.blobs === 0 && !dbIdle.log.some((l) => l.startsWith("delete")) && dbIdle.log.at(-1) === "COMMIT");
check("pruneThread: keep < 1 ไม่แตะฐานข้อมูลเลย", zeroMsg.includes("ต้องเก็บอย่างน้อย 1") && dbZero.log.length === 0 && dbZero.checkpoints.length === 5);
check("staleThreads: เก่ากว่าเกณฑ์จริง ๆ เท่านั้น (เท่ากับเกณฑ์ไม่นับ)", JSON.stringify(stale) === '["old","old2"]');
check("Postgres จริง: ลบเหลือ 2 checkpoint, อ่านสถานะได้ n=6 และรันต่อได้ n=7", before > 2 && after === 2 && nAfterPrune === 6 && nNext === 7, "ตรวจ docker compose และ DATABASE_URL");
