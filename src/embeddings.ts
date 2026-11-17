import type { Embeddings } from "@langchain/core/embeddings";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "./env";

// ================================================================
// "จุดเดียว" ที่รู้ว่าสร้างตัวทำ embedding ของเจ้าไหน (เหมือน getLLM() ใน src/llm.ts)
// บทเรียนเรียก getEmbeddings() ไม่ import แพ็กเกจของ provider ตรง ๆ
// เปลี่ยนโมเดลหรือจำนวนมิติที่ .env: EMBEDDING_MODEL, EMBEDDING_DIMENSIONS
// ตัวตรวจ (test) ของทุกบทใช้ embedding ปลอมจาก src/rag.ts ไม่เรียกฟังก์ชันนี้
// ================================================================

const MIN_KEY_LENGTH = 10;

export interface EmbeddingConfig {
  apiKey: string;
  model: string;
  dimensions: number;
}

export function buildEmbeddings(config: EmbeddingConfig): Embeddings {
  if (config.apiKey.length < MIN_KEY_LENGTH) {
    throw new Error("ยังไม่ได้ตั้ง GOOGLE_API_KEY ใน .env (ขอ key ฟรีที่ Google AI Studio แล้วใส่ใน .env ดู .env.example)");
  }
  return new GoogleGenerativeAIEmbeddings({
    model: config.model,
    apiKey: config.apiKey,
    outputDimensionality: config.dimensions,
  } as never);
}

export function getEmbeddings(): Embeddings {
  return buildEmbeddings({ apiKey: env.GOOGLE_API_KEY, model: env.EMBEDDING_MODEL, dimensions: env.EMBEDDING_DIMENSIONS });
}

/** จำนวนมิติที่ตั้งไว้ ใช้ตอนสร้างตาราง vector(N) ให้ตรงกับ embedding */
export function embeddingDimensions(): number {
  return env.EMBEDDING_DIMENSIONS;
}
