import type { Embeddings } from "@langchain/core/embeddings";
import { type Chunk, type Hit, KeywordEmbeddings, SAMPLE_DOCS, cosine } from "@src/rag";
import { todo } from "@src/todo";
import { getEmbeddings } from "@src/embeddings";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-18  (ส่วนสุดท้ายเรียก embedding จริง ต้องมี GOOGLE_API_KEY ใน .env)
// vector store: เก็บชิ้นเอกสารพร้อมเวกเตอร์ของมัน (embed ตอน add ครั้งเดียว) ค้นหาด้วยการเทียบเวกเตอร์ของคำถามกับทุกชิ้น
class SimpleIndex {
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

// ส่วนที่ 1: embedding ปลอม (นับคำสำคัญ) ตรวจพฤติกรรมของ index
const index = new SimpleIndex(new KeywordEmbeddings());
const emptyHits = await index.search("อะไรก็ได้", 3);
await index.add(SAMPLE_DOCS);
const hits = await index.search("คืนเงินได้ไหม", 3);
const limited = await index.search("ลา", 2);

// add หลายครั้งต้องสะสมต่อกัน ไม่ทับของเดิม
const accumulating = new SimpleIndex(new KeywordEmbeddings());
await accumulating.add([SAMPLE_DOCS[0]]);
await accumulating.add([SAMPLE_DOCS[1], SAMPLE_DOCS[2]]);
const accumulated = await accumulating.search("รหัสผ่าน", 10);

// embed เอกสารตอน add ครั้งเดียว ไม่ embed ซ้ำทุกครั้งที่ค้นหา
const counting = new KeywordEmbeddings();
let docCalls = 0;
const original = counting.embedDocuments.bind(counting);
counting.embedDocuments = async (texts: string[]) => {
  docCalls++;
  return original(texts);
};
const once = new SimpleIndex(counting);
await once.add(SAMPLE_DOCS);
await once.search("ลา", 1);
await once.search("vpn", 1);

// ส่วนที่ 2: embedding จริง: index เดียวกัน ค้นตามความหมาย
const real = new SimpleIndex(getEmbeddings());
await real.add(SAMPLE_DOCS);
const realHits = await real.search("ขอเงินที่จ่ายไปคืนได้ไหม", 1);
console.log("embedding จริง:", realHits[0]);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ค้นหา: ชิ้นที่ตรงที่สุดมาก่อน พร้อมที่มาและคะแนน", hits[0].source === "shop.md" && hits[0].score > hits[1].score && hits[0].text.includes("คืนเงิน"), "{ ...chunk, score } แล้ว sort มากไปน้อย");
check("store ว่างคืนอาร์เรย์ว่าง และจำกัดจำนวนด้วย k", emptyHits.length === 0 && limited.length === 2);
check("add หลายครั้งสะสมต่อกัน ไม่ทับของเดิม", accumulated.length === 3, "push ต่อ this.items");
check("embed เอกสารตอน add ครั้งเดียว ไม่ embed ซ้ำตอนค้นหา", docCalls === 1, "embedDocuments เฉพาะใน add; ใน search ใช้ embedQuery");
check("embedding จริง: ถามว่า 'ขอเงินคืน' เจอเอกสารเรื่องคืนเงิน", realHits[0].source === "shop.md", "ตรวจ GOOGLE_API_KEY ใน .env");
