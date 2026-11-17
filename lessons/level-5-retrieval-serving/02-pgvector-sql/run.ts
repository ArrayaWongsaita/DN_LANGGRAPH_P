import pg from "pg";
import { getEmbeddings, embeddingDimensions } from "@src/embeddings";
import { SAMPLE_DOCS } from "@src/rag";
import { createTableSql, searchChunks, upsertChunk } from "./pgvector";

// ต้องเปิด Docker (docker compose up -d --wait), ตั้ง DATABASE_URL และ GOOGLE_API_KEY ใน .env
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
try {
  const embeddings = getEmbeddings();
  const dims = embeddingDimensions();
  await pool.query("DROP TABLE IF EXISTS course_chunks"); // ตารางของคอร์สนี้ ลบสร้างใหม่ให้มิติตรงเสมอ
  for (const sql of createTableSql(dims)) await pool.query(sql);

  const vectors = await embeddings.embedDocuments(SAMPLE_DOCS.map((d) => d.text));
  for (const [i, doc] of SAMPLE_DOCS.entries()) await upsertChunk(pool, { id: doc.source, source: doc.source, text: doc.text }, vectors[i]);

  const hits = await searchChunks(pool, await embeddings.embedQuery("ลืมพาสเวิร์ดทำยังไง"), 3);
  for (const h of hits) console.log(h.score.toFixed(3), h.source, h.text);
} finally {
  await pool.end();
}
