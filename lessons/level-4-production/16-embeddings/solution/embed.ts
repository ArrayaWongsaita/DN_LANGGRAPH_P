import type { Embeddings } from "@langchain/core/embeddings";

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface Ranked {
  text: string;
  score: number;
}

export async function rank(query: string, docs: string[], embeddings: Embeddings, k: number): Promise<Ranked[]> {
  const q = await embeddings.embedQuery(query);
  const vectors = await embeddings.embedDocuments(docs);
  return docs
    .map((text, i) => ({ text, score: cosineSimilarity(q, vectors[i]) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, k);
}
