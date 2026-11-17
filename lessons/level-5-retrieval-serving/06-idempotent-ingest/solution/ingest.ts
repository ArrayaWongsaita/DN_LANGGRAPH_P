import { createHash } from "node:crypto";
import type { Embeddings } from "@langchain/core/embeddings";

export interface Row {
  id: string;
  docId: string;
  text: string;
}

export interface Table {
  idsForDoc(docId: string): Promise<string[]>;
  upsert(items: { row: Row; vector: number[] }[]): Promise<void>;
  remove(ids: string[]): Promise<void>;
}

export function chunkId(docId: string, text: string): string {
  return `${docId}:${createHash("sha256").update(text).digest("hex").slice(0, 16)}`;
}

export interface Plan {
  toAdd: Row[];
  toRemove: string[];
  unchanged: number;
}

export function planSync(existingIds: string[], wanted: Row[]): Plan {
  const existing = new Set(existingIds);
  const wantedIds = new Set(wanted.map((r) => r.id));
  return {
    toAdd: wanted.filter((r) => !existing.has(r.id)),
    toRemove: existingIds.filter((id) => !wantedIds.has(id)),
    unchanged: wanted.filter((r) => existing.has(r.id)).length,
  };
}

export async function ingestDoc(
  table: Table,
  embeddings: Embeddings,
  docId: string,
  chunks: string[],
): Promise<{ added: number; removed: number; unchanged: number }> {
  const byId = new Map<string, Row>();
  for (const text of chunks) {
    const id = chunkId(docId, text);
    if (!byId.has(id)) byId.set(id, { id, docId, text });
  }
  const plan = planSync(await table.idsForDoc(docId), [...byId.values()]);

  if (plan.toAdd.length > 0) {
    const vectors = await embeddings.embedDocuments(plan.toAdd.map((r) => r.text));
    await table.upsert(plan.toAdd.map((row, i) => ({ row, vector: vectors[i] })));
  }
  if (plan.toRemove.length > 0) await table.remove(plan.toRemove);

  return { added: plan.toAdd.length, removed: plan.toRemove.length, unchanged: plan.unchanged };
}
