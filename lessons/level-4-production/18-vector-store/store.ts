import type { Embeddings } from "@langchain/core/embeddings";
import { type Chunk, type Hit, cosine } from "@src/rag";
import { todo } from "@src/todo";

export class SimpleIndex {
  private items: { chunk: Chunk; vector: number[] }[] = [];

  constructor(private readonly embeddings: Embeddings) {}

  async add(chunks: Chunk[]): Promise<void> {
    // 👉 ข้อ 1: vectors = await this.embeddings.embedDocuments(chunks.map((c) => c.text))
    //          แล้ว push { chunk, vector } ของทุกชิ้นลง this.items (ต่อท้ายของเดิม ไม่ทับ)
    todo(1);
  }

  async search(query: string, k: number): Promise<Hit[]> {
    // 👉 ข้อ 2: q = await this.embeddings.embedQuery(query) แล้วสร้าง { ...chunk, score: cosine(q, vector) } ของทุกรายการ
    //          เรียง score มากไปน้อย แล้ว slice(0, k)
    return todo(2);
  }
}
