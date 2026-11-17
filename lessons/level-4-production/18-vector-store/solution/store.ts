import type { Embeddings } from "@langchain/core/embeddings";
import { type Chunk, type Hit, cosine } from "@src/rag";

export class SimpleIndex {
  private items: { chunk: Chunk; vector: number[] }[] = [];

  constructor(private readonly embeddings: Embeddings) {}

  async add(chunks: Chunk[]): Promise<void> {
    const vectors = await this.embeddings.embedDocuments(chunks.map((c) => c.text));
    chunks.forEach((chunk, i) => this.items.push({ chunk, vector: vectors[i] }));
  }

  async search(query: string, k: number): Promise<Hit[]> {
    const q = await this.embeddings.embedQuery(query);
    return this.items
      .map((item) => ({ ...item.chunk, score: cosine(q, item.vector) }))
      .sort((x, y) => y.score - x.score)
      .slice(0, k);
  }
}
