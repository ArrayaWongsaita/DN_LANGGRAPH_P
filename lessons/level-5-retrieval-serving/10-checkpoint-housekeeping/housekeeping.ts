import { todo } from "@src/todo";

// client ของ pg (Pool หรือ PoolClient) ใช้แทนได้ ธุรกรรมต้องใช้ client ตัวเดียว (pool.connect())
export interface Db {
  query(sql: string, params?: unknown[]): Promise<{ rows: any[] }>;
}

export const SQL = {
  listCheckpoints:
    "SELECT checkpoint_ns AS ns, checkpoint_id AS id, checkpoint->'channel_versions' AS channel_versions FROM checkpoints WHERE thread_id = $1 ORDER BY checkpoint_id DESC",
  listBlobs: "SELECT checkpoint_ns AS ns, channel, version FROM checkpoint_blobs WHERE thread_id = $1",
  deleteCheckpoints: "DELETE FROM checkpoints WHERE thread_id = $1 AND checkpoint_id = ANY($2::text[])",
  deleteWrites: "DELETE FROM checkpoint_writes WHERE thread_id = $1 AND checkpoint_id = ANY($2::text[])",
  deleteBlobs:
    "DELETE FROM checkpoint_blobs WHERE thread_id = $1 AND (checkpoint_ns, channel, version) IN (SELECT * FROM unnest($2::text[], $3::text[], $4::text[]))",
} as const;

export interface CheckpointRow {
  ns: string;
  id: string;
}

export interface BlobRow {
  ns: string;
  channel: string;
  version: string;
}

// คืน checkpoint ที่ "ควรลบ": เก็บ id ใหม่สุด `keep` อันต่อ namespace (id เรียงตามตัวอักษร = เรียงตามเวลา)
export function planPrune(rows: CheckpointRow[], keep: number): CheckpointRow[] {
  // 👉 ข้อ 1: keep < 1 ให้ throw new Error("ต้องเก็บอย่างน้อย 1 checkpoint")
  //          แยกกลุ่มตาม ns, เรียง id มากไปน้อยในแต่ละกลุ่ม, ข้าม `keep` อันแรก ที่เหลือคือที่ต้องลบ (rows อาจมาในลำดับใดก็ได้)
  return todo(1);
}

// blob ที่ไม่มี checkpoint ที่เหลืออยู่อ้างถึง: checkpoint อ้าง blob เมื่อ channel_versions[channel] เท่ากับ version (เทียบเป็นสตริง) ใน ns เดียวกัน
export function findOrphanBlobs(blobs: BlobRow[], kept: { ns: string; channel_versions: Record<string, string | number> }[]): BlobRow[] {
  // 👉 ข้อ 2: สร้างเซตของ `${ns}|${channel}|${version}` จาก kept แล้วคืน blob ที่ไม่อยู่ในเซตนั้น
  return todo(2);
}

// ลบ checkpoint เก่าของ thread ในธุรกรรมเดียว คืนจำนวนที่ลบ
export async function pruneThread(db: Db, threadId: string, keep: number): Promise<{ checkpoints: number; blobs: number }> {
  // 👉 ข้อ 3: ลำดับ: (ตรวจ keep ก่อนแตะฐานข้อมูล: เรียก planPrune ที่ให้ rows ว่างก็ได้ หรือ throw เองถ้า keep < 1)
  //   1) db.query("BEGIN")
  //   2) rows = (await db.query(SQL.listCheckpoints, [threadId])).rows; doomed = planPrune(rows, keep)
  //      ถ้า doomed ว่าง: COMMIT แล้วคืน { checkpoints: 0, blobs: 0 }
  //   3) ids = doomed.map(d => d.id): query SQL.deleteWrites แล้ว SQL.deleteCheckpoints ด้วย [threadId, ids]
  //   4) kept = rows ที่ id ไม่อยู่ใน ids; blobs = (await db.query(SQL.listBlobs, [threadId])).rows
  //      orphans = findOrphanBlobs(blobs, kept); ถ้ามี: query SQL.deleteBlobs ด้วย [threadId, orphans.map(ns), orphans.map(channel), orphans.map(version)]
  //   5) db.query("COMMIT") แล้วคืน { checkpoints: doomed.length, blobs: orphans.length }
  //   ถ้าขั้นใดโยน error หลัง BEGIN: db.query("ROLLBACK") แล้ว throw ต่อ (ห้าม COMMIT)
  return todo(3);
}

// thread ที่ไม่มีความเคลื่อนไหวนานกว่า maxAgeDays วัน (เก่ากว่าเกณฑ์จริง ๆ: เท่ากับเกณฑ์ยังไม่ถือว่าเก่า)
export function staleThreads(threads: { threadId: string; lastActivity: Date }[], now: Date, maxAgeDays: number): string[] {
  // 👉 ข้อ 4: คืน threadId ของ thread ที่ now - lastActivity > maxAgeDays * 24 ชั่วโมง คงลำดับเดิม
  return todo(4);
}
