// KnowledgeBase บน Postgres + pgvector (ให้ไว้แล้ว ไม่ต้องแก้) ใช้ pattern จากบท 5-02 และ 5-06
import type { Embeddings } from "@langchain/core/embeddings";
import type pg from "pg";
import type { Hit, KbRow, KnowledgeBase } from "./assistant";

const TABLE = "capstone_chunks";

export async function setupKb(pool: pg.Pool, dims: number, reset = false): Promise<void> {
  if (reset) await pool.query(`DROP TABLE IF EXISTS ${TABLE}`);
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
  await pool.query(
    `CREATE TABLE IF NOT EXISTS ${TABLE} (id text PRIMARY KEY, doc_id text NOT NULL, source text NOT NULL, text text NOT NULL, embedding vector(${dims}) NOT NULL)`,
  );
}

const literal = (v: number[]) => `[${v.join(",")}]`;
const toHit = (r: Record<string, unknown>): Hit => ({ id: String(r.id), source: String(r.source), text: String(r.text) });

export function createPgKb(pool: pg.Pool, embeddings: Embeddings): KnowledgeBase {
  return {
    async idsForDoc(docId) {
      const { rows } = await pool.query(`SELECT id FROM ${TABLE} WHERE doc_id = $1`, [docId]);
      return rows.map((r) => String(r.id));
    },
    async upsert(rows: KbRow[]) {
      const vectors = await embeddings.embedDocuments(rows.map((r) => r.text));
      for (const [i, r] of rows.entries()) {
        await pool.query(
          `INSERT INTO ${TABLE} (id, doc_id, source, text, embedding) VALUES ($1, $2, $3, $4, $5::vector)
           ON CONFLICT (id) DO UPDATE SET doc_id = $2, source = $3, text = $4, embedding = $5::vector`,
          [r.id, r.docId, r.source, r.text, literal(vectors[i])],
        );
      }
    },
    async remove(ids) {
      await pool.query(`DELETE FROM ${TABLE} WHERE id = ANY($1::text[])`, [ids]);
    },
    async vectorSearch(query, k) {
      const q = literal(await embeddings.embedQuery(query));
      const { rows } = await pool.query(`SELECT id, source, text FROM ${TABLE} ORDER BY embedding <=> $1::vector LIMIT $2`, [q, k]);
      return rows.map(toHit);
    },
    async keywordSearch(query, k) {
      const terms = query.split(/\s+/).filter(Boolean).map((t) => `%${t.replace(/[%_\\]/g, "\\$&")}%`);
      if (terms.length === 0) return [];
      const { rows } = await pool.query(`SELECT id, source, text FROM ${TABLE} WHERE text ILIKE ANY($1::text[]) LIMIT $2`, [terms, k]);
      return rows.map(toHit);
    },
  };
}
