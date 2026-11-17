import type { Embeddings } from "@langchain/core/embeddings";

export function chunked<T>(items: T[], size: number): T[][] {
  if (size < 1) throw new Error("batchSize ต้องมากกว่า 0");
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size));
  return groups;
}

export async function embedInBatches(embeddings: Embeddings, texts: string[], batchSize: number): Promise<number[][]> {
  const all: number[][] = [];
  for (const group of chunked(texts, batchSize)) {
    all.push(...(await embeddings.embedDocuments(group)));
  }
  return all;
}

export function assertDimensions(vectors: number[][], dims: number): void {
  vectors.forEach((v, i) => {
    if (v.length !== dims) throw new Error(`เวกเตอร์ตัวที่ ${i} มี ${v.length} มิติ แต่ต้องเป็น ${dims}`);
  });
}
