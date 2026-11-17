import { todo } from "@src/todo";

export interface Db {
  query(text: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

export interface Hit {
  source: string;
  text: string;
  score: number;
}

// (ให้ไว้แล้ว) สร้างตารางและดัชนี
export function createTableSql(dims: number): string[] {
  return [
    "CREATE EXTENSION IF NOT EXISTS vector",
    `CREATE TABLE IF NOT EXISTS course_chunks (id text PRIMARY KEY, source text NOT NULL, text text NOT NULL, embedding vector(${dims}) NOT NULL)`,
    "CREATE INDEX IF NOT EXISTS course_chunks_embedding_idx ON course_chunks USING hnsw (embedding vector_cosine_ops)",
  ];
}

// (ให้ไว้แล้ว) เพิ่ม/อัปเดตหนึ่งแถว ค่าทั้งหมดผ่านพารามิเตอร์
export async function upsertChunk(db: Db, row: { id: string; source: string; text: string }, vector: number[]): Promise<void> {
  await db.query(
    "INSERT INTO course_chunks (id, source, text, embedding) VALUES ($1, $2, $3, $4::vector) ON CONFLICT (id) DO UPDATE SET source = $2, text = $3, embedding = $4::vector",
    [row.id, row.source, row.text, toVectorLiteral(vector)],
  );
}

export function toVectorLiteral(vector: number[]): string {
  // 👉 ข้อ 1: ถ้ามีค่าใดไม่ใช่ตัวเลขจำกัด (NaN/Infinity) ให้ throw new Error("เวกเตอร์มีค่าที่ไม่ใช่ตัวเลข")
  //          ไม่เช่นนั้นคืน `[${vector.join(",")}]` เช่น [0.1,-2,3]
  return todo(1);
}

export function searchSql(): string {
  // 👉 ข้อ 2: คืน SQL หนึ่งคำสั่ง (ค่าทั้งหมดผ่านพารามิเตอร์ $1 = เวกเตอร์, $2 = จำนวนสูงสุด):
  //   SELECT source, text, 1 - (embedding <=> $1::vector) AS score FROM course_chunks ORDER BY embedding <=> $1::vector LIMIT $2
  return todo(2);
}

export async function searchChunks(db: Db, queryVector: number[], k: number): Promise<Hit[]> {
  // 👉 ข้อ 3: เรียก db.query(searchSql(), [toVectorLiteral(queryVector), k])
  //          แล้วแปลงแต่ละแถวเป็น { source, text, score: Number(row.score) } (ฐานข้อมูลอาจส่ง score มาเป็นสตริง)
  return todo(3);
}
