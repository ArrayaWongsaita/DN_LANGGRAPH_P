import pg from "pg";
import { getEmbeddings, embeddingDimensions } from "@src/embeddings";
import { SAMPLE_DOCS } from "@src/rag";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-02  (ต้องเปิดฐานข้อมูล docker compose up -d --wait และมี DATABASE_URL กับ GOOGLE_API_KEY ใน .env)
// pgvector: เก็บเวกเตอร์เป็นคอลัมน์ vector(N) ใน Postgres แล้วหาเพื่อนบ้านใกล้สุดด้วยตัวดำเนินการ <=> (ระยะ cosine: ยิ่งน้อยยิ่งคล้าย) ค่าทั้งหมดส่งผ่านพารามิเตอร์ ห้ามต่อสตริงเข้า SQL
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

interface Db {
  query(text: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
}

interface Hit {
  source: string;
  text: string;
  score: number;
}

// (ให้ไว้แล้ว) สร้างตารางและดัชนี
function createTableSql(dims: number): string[] {
  return [
    "CREATE EXTENSION IF NOT EXISTS vector",
    `CREATE TABLE IF NOT EXISTS course_chunks (id text PRIMARY KEY, source text NOT NULL, text text NOT NULL, embedding vector(${dims}) NOT NULL)`,
    "CREATE INDEX IF NOT EXISTS course_chunks_embedding_idx ON course_chunks USING hnsw (embedding vector_cosine_ops)",
  ];
}

// (ให้ไว้แล้ว) เพิ่ม/อัปเดตหนึ่งแถว ค่าทั้งหมดผ่านพารามิเตอร์
async function upsertChunk(db: Db, row: { id: string; source: string; text: string }, vector: number[]): Promise<void> {
  await db.query(
    "INSERT INTO course_chunks (id, source, text, embedding) VALUES ($1, $2, $3, $4::vector) ON CONFLICT (id) DO UPDATE SET source = $2, text = $3, embedding = $4::vector",
    [row.id, row.source, row.text, toVectorLiteral(vector)],
  );
}

function toVectorLiteral(vector: number[]): string {
  // ข้อ 1: ถ้ามีค่าใดไม่ใช่ตัวเลขจำกัด (NaN/Infinity) ให้ throw new Error("เวกเตอร์มีค่าที่ไม่ใช่ตัวเลข")
  //          ไม่เช่นนั้นคืน `[${vector.join(",")}]` เช่น [0.1,-2,3]
  if (vector.some((v) => !Number.isFinite(v))) throw new Error("เวกเตอร์มีค่าที่ไม่ใช่ตัวเลข");
  return `[${vector.join(",")}]`;
}

function searchSql(): string {
  // ข้อ 2: คืน SQL หนึ่งคำสั่ง (ค่าทั้งหมดผ่านพารามิเตอร์ $1 = เวกเตอร์, $2 = จำนวนสูงสุด):
  //   SELECT source, text, 1 - (embedding <=> $1::vector) AS score FROM course_chunks ORDER BY embedding <=> $1::vector LIMIT $2
  return "SELECT source, text, 1 - (embedding <=> $1::vector) AS score FROM course_chunks ORDER BY embedding <=> $1::vector LIMIT $2";
}

async function searchChunks(db: Db, queryVector: number[], k: number): Promise<Hit[]> {
  // ข้อ 3: เรียก db.query(searchSql(), [toVectorLiteral(queryVector), k])
  //          แล้วแปลงแต่ละแถวเป็น { source, text, score: Number(row.score) } (ฐานข้อมูลอาจส่ง score มาเป็นสตริง)
  const { rows } = await db.query(searchSql(), [toVectorLiteral(queryVector), k]);
  return rows.map((row) => ({ source: String(row.source), text: String(row.text), score: Number(row.score) }));
}

// ฐานข้อมูลปลอมที่จด SQL และพารามิเตอร์ที่ได้รับ (ตรวจว่าเราไม่ต่อสตริงเข้า SQL)
function fakeDb(rows: Record<string, unknown>[] = []) {
  const calls: { text: string; values?: unknown[] }[] = [];
  const db: Db = {
    async query(text, values) {
      calls.push({ text, values });
      return { rows };
    },
  };
  return { db, calls };
}
const throws = (fn: () => void): string => {
  try {
    fn();
    return "";
  } catch (e) {
    return (e as Error).message;
  }
};
const sql = searchSql();
const fake = fakeDb();
await searchChunks(fake.db, [0.5, 0.25], 3);
const typed = await searchChunks(fakeDb([{ source: "it.md", text: "รีเซ็ตรหัสผ่าน", score: "0.91" }, { source: "hr.md", text: "ลาป่วย", score: 0.4 }]).db, [1], 2);
const none = await searchChunks(fakeDb([]).db, [1], 5);
const up = fakeDb();
await upsertChunk(up.db, { id: "a", source: "s.md", text: "ข้อความ" }, [1, 2]);

// ของจริง: Postgres + embedding จริง
const pool = new pg.Pool({ connectionString: url });
let hits: Hit[] = [];
try {
  const embeddings = getEmbeddings();
  await pool.query("DROP TABLE IF EXISTS course_chunks"); // ตารางของคอร์สนี้ ลบสร้างใหม่ให้มิติตรงเสมอ
  for (const stmt of createTableSql(embeddingDimensions())) await pool.query(stmt);
  const vectors = await embeddings.embedDocuments(SAMPLE_DOCS.map((d) => d.text));
  for (const [i, doc] of SAMPLE_DOCS.entries()) await upsertChunk(pool, { id: doc.source, source: doc.source, text: doc.text }, vectors[i]);
  hits = await searchChunks(pool, await embeddings.embedQuery("ลืมพาสเวิร์ดทำยังไง"), 3);
  for (const h of hits) console.log(h.score.toFixed(3), h.source, h.text);
} finally {
  await pool.end();
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("toVectorLiteral: รูป [a,b,c] ที่ pgvector อ่านได้", toVectorLiteral([0.1, -2, 3]) === "[0.1,-2,3]" && toVectorLiteral([]) === "[]");
check("toVectorLiteral: ค่าที่ไม่ใช่ตัวเลขจำกัดถูกปฏิเสธ", throws(() => toVectorLiteral([1, Number.NaN])).includes("ไม่ใช่ตัวเลข") && throws(() => toVectorLiteral([Number.POSITIVE_INFINITY])).includes("ไม่ใช่ตัวเลข"));
check("searchSql: เรียงตามระยะ cosine จากน้อยไปมาก จำกัดจำนวน และใช้พารามิเตอร์", /ORDER BY\s+embedding\s*<=>\s*\$1::vector\s+LIMIT\s+\$2/i.test(sql) && !/DESC/i.test(sql) && /1\s*-\s*\(\s*embedding\s*<=>\s*\$1::vector\s*\)\s+AS\s+score/i.test(sql) && /FROM\s+course_chunks/i.test(sql));
check("searchChunks: ส่งเวกเตอร์และ k เป็นพารามิเตอร์ ไม่ต่อสตริงเข้า SQL", fake.calls.length === 1 && JSON.stringify(fake.calls[0].values) === '["[0.5,0.25]",3]' && !fake.calls[0].text.includes("0.5"));
check("searchChunks: แปลงแถวเป็น Hit และ score เป็นตัวเลขแม้ฐานข้อมูลส่งเป็นสตริง", typed.length === 2 && typed[0].score === 0.91 && typed[0].source === "it.md" && typed[1].score === 0.4);
check("searchChunks: ไม่พบแถวเลยได้อาร์เรย์ว่าง", none.length === 0);
check("upsertChunk (โค้ดที่ให้ไว้) ใช้ toVectorLiteral ของคุณและพารามิเตอร์ครบ", JSON.stringify(up.calls[0].values) === '["a","s.md","ข้อความ","[1,2]"]');
check("ฐานข้อมูลจริง: ถามว่า 'ลืมพาสเวิร์ด' เจอเอกสาร it.md ก่อน และคะแนนเรียงมากไปน้อย", hits.length === 3 && hits[0].source === "it.md" && hits[0].score >= hits[1].score, "ตรวจ docker compose up -d --wait และ DATABASE_URL");
