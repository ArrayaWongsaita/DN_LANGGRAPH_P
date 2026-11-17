export interface Db {
  query(text: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

export interface Hit {
  source: string;
  text: string;
  score: number;
}

export function createTableSql(dims: number): string[] {
  return [
    "CREATE EXTENSION IF NOT EXISTS vector",
    `CREATE TABLE IF NOT EXISTS course_chunks (id text PRIMARY KEY, source text NOT NULL, text text NOT NULL, embedding vector(${dims}) NOT NULL)`,
    "CREATE INDEX IF NOT EXISTS course_chunks_embedding_idx ON course_chunks USING hnsw (embedding vector_cosine_ops)",
  ];
}

export async function upsertChunk(db: Db, row: { id: string; source: string; text: string }, vector: number[]): Promise<void> {
  await db.query(
    "INSERT INTO course_chunks (id, source, text, embedding) VALUES ($1, $2, $3, $4::vector) ON CONFLICT (id) DO UPDATE SET source = $2, text = $3, embedding = $4::vector",
    [row.id, row.source, row.text, toVectorLiteral(vector)],
  );
}

export function toVectorLiteral(vector: number[]): string {
  if (vector.some((v) => !Number.isFinite(v))) throw new Error("เวกเตอร์มีค่าที่ไม่ใช่ตัวเลข");
  return `[${vector.join(",")}]`;
}

export function searchSql(): string {
  return "SELECT source, text, 1 - (embedding <=> $1::vector) AS score FROM course_chunks ORDER BY embedding <=> $1::vector LIMIT $2";
}

export async function searchChunks(db: Db, queryVector: number[], k: number): Promise<Hit[]> {
  const { rows } = await db.query(searchSql(), [toVectorLiteral(queryVector), k]);
  return rows.map((row) => ({ source: String(row.source), text: String(row.text), score: Number(row.score) }));
}
