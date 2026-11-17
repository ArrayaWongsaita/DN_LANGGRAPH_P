import { Embeddings } from "@langchain/core/embeddings";

// ================================================================
// ตัวช่วย RAG สำหรับบทเรียน Level 4 (ใช้ในตัวตรวจ ไม่ต้องมี key)
// - KeywordEmbeddings: embedding ปลอมที่ "นับคำสำคัญ" ให้ผลแน่นอนและอธิบายได้
//   ของจริงใช้โมเดล embedding (เช่น text-embedding ของผู้ให้บริการ) ที่จับ "ความหมาย" ได้
// - cosine / InMemoryIndex: ตัวอ้างอิงการค้นหาแบบ vector ในหน่วยความจำ
// ================================================================

export const VOCAB = ["ลา", "รหัสผ่าน", "vpn", "คืนเงิน", "จัดส่ง", "เงินเดือน"] as const;

export class KeywordEmbeddings extends Embeddings {
  constructor() {
    super({});
  }
  async embedQuery(text: string): Promise<number[]> {
    const lower = text.toLowerCase();
    return VOCAB.map((word) => lower.split(word).length - 1);
  }
  async embedDocuments(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embedQuery(t)));
  }
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na === 0 || nb === 0 ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export interface Chunk {
  text: string;
  source: string;
}

export interface Hit extends Chunk {
  score: number;
}

export class InMemoryIndex {
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

export const SAMPLE_DOCS: Chunk[] = [
  { source: "hr.md", text: "พนักงานลาป่วยได้ปีละ 30 วัน ต้องแจ้งหัวหน้า และเงินเดือนจ่ายสิ้นเดือน" },
  { source: "it.md", text: "ลืมรหัสผ่านให้รีเซ็ตที่พอร์ทัล IT และต้องเปิด VPN เมื่อทำงานนอกออฟฟิศ" },
  { source: "shop.md", text: "สินค้าคืนเงินได้ภายใน 7 วัน การจัดส่งใช้เวลา 3 วัน" },
];
