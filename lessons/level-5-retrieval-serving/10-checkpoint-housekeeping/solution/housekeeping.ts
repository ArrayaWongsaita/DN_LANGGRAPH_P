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

export function planPrune(rows: CheckpointRow[], keep: number): CheckpointRow[] {
  if (keep < 1) throw new Error("ต้องเก็บอย่างน้อย 1 checkpoint");
  const byNs = new Map<string, CheckpointRow[]>();
  for (const row of rows) byNs.set(row.ns, [...(byNs.get(row.ns) ?? []), row]);
  const doomed: CheckpointRow[] = [];
  for (const group of byNs.values()) {
    group.sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
    doomed.push(...group.slice(keep));
  }
  return doomed;
}

export function findOrphanBlobs(blobs: BlobRow[], kept: { ns: string; channel_versions: Record<string, string | number> }[]): BlobRow[] {
  const referenced = new Set<string>();
  for (const cp of kept) {
    for (const [channel, version] of Object.entries(cp.channel_versions ?? {})) referenced.add(`${cp.ns}|${channel}|${version}`);
  }
  return blobs.filter((b) => !referenced.has(`${b.ns}|${b.channel}|${b.version}`));
}

export async function pruneThread(db: Db, threadId: string, keep: number): Promise<{ checkpoints: number; blobs: number }> {
  if (keep < 1) throw new Error("ต้องเก็บอย่างน้อย 1 checkpoint");
  await db.query("BEGIN");
  try {
    const rows = (await db.query(SQL.listCheckpoints, [threadId])).rows;
    const doomed = planPrune(rows, keep);
    if (doomed.length === 0) {
      await db.query("COMMIT");
      return { checkpoints: 0, blobs: 0 };
    }
    const ids = doomed.map((d) => d.id);
    await db.query(SQL.deleteWrites, [threadId, ids]);
    await db.query(SQL.deleteCheckpoints, [threadId, ids]);
    const kept = rows.filter((r) => !ids.includes(r.id));
    const blobs = (await db.query(SQL.listBlobs, [threadId])).rows;
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

export function staleThreads(threads: { threadId: string; lastActivity: Date }[], now: Date, maxAgeDays: number): string[] {
  const limit = maxAgeDays * 24 * 60 * 60 * 1000;
  return threads.filter((t) => now.getTime() - t.lastActivity.getTime() > limit).map((t) => t.threadId);
}
