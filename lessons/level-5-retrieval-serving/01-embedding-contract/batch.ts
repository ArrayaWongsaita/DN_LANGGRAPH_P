import { Embeddings } from "@langchain/core/embeddings";
import { todo } from "@src/todo";
import { getEmbeddings, embeddingDimensions } from "@src/embeddings";
import { cosine } from "@src/rag";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-01  (ต้องมี GOOGLE_API_KEY ใน .env เพราะเรียก embedding จริง)
// สัญญาของ embedding: (1) ส่งเป็นกลุ่มเล็ก ๆ ทีละกลุ่ม (ผู้ให้บริการมีเพดานต่อคำขอ) (2) เวกเตอร์ทุกตัวต้องมีจำนวนมิติตามที่ตารางฐานข้อมูลกำหนด (3) ข้อความเอกสารกับคำถามต้องใช้โมเดลเดียวกัน

// แบ่ง items เป็นกลุ่มละ size ตัว (กลุ่มสุดท้ายอาจน้อยกว่า)
function chunked<T>(items: T[], size: number): T[][] {
  // 👉 ข้อ 1: ถ้า size < 1 ให้ throw new Error("batchSize ต้องมากกว่า 0")
  //          ไม่เช่นนั้นคืนอาร์เรย์ของกลุ่ม เช่น chunked([1,2,3,4,5], 2) = [[1,2],[3,4],[5]] (รายการว่างได้ [])
  return todo(1);
}

// embed ทีละกลุ่ม "ตามลำดับ" (ไม่ส่งพร้อมกัน) แล้วรวมผลเรียงตามข้อความ
async function embedInBatches(embeddings: Embeddings, texts: string[], batchSize: number): Promise<number[][]> {
  // 👉 ข้อ 2: วนแต่ละกลุ่มจาก chunked(texts, batchSize) เรียก await embeddings.embedDocuments(กลุ่ม)
  //          แล้วต่อผลลัพธ์เข้าด้วยกัน (ไม่มีข้อความ = ไม่เรียก embedding เลย)
  return todo(2);
}

function assertDimensions(vectors: number[][], dims: number): void {
  // 👉 ข้อ 3: ถ้ามีเวกเตอร์ตัวใดยาวไม่เท่า dims ให้ throw new Error(`เวกเตอร์ตัวที่ ${i} มี ${จริง} มิติ แต่ต้องเป็น ${dims}`)
  //          (i นับจาก 0 ตัวแรกที่ผิด)
  todo(3);
}

// embedding จริง: คำถามไม่มีคำซ้ำกับเอกสารแรกเลย แต่คะแนนสูงสุดควรเป็นเอกสารเรื่องรหัสผ่าน
const embeddings = getEmbeddings();
const docs = ["ลืมรหัสผ่านให้รีเซ็ตที่พอร์ทัล IT", "สินค้าคืนเงินได้ภายใน 7 วัน", "ลาป่วยได้ปีละ 30 วัน"];
const vectors = await embedInBatches(embeddings, docs, 2);
assertDimensions(vectors, embeddingDimensions());
const query = await embeddings.embedQuery("ลืมพาสเวิร์ดทำยังไง");
assertDimensions([query], embeddingDimensions());
const scores = docs.map((_, i) => cosine(query, vectors[i]));
docs.forEach((doc, i) => console.log(scores[i].toFixed(3), doc));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
// embedding ปลอมที่จดว่าถูกเรียกกี่ครั้ง กลุ่มละเท่าไร และซ้อนกันไหม
class RecordingEmbeddings extends Embeddings {
  batches: string[][] = [];
  active = 0;
  maxActive = 0;
  constructor() {
    super({});
  }
  async embedQuery(text: string) {
    return [text.length];
  }
  async embedDocuments(texts: string[]) {
    this.active++;
    this.maxActive = Math.max(this.maxActive, this.active);
    this.batches.push(texts);
    await new Promise((r) => setTimeout(r, 5));
    this.active--;
    return texts.map((t) => [t.length, 1]);
  }
}
const fake = new RecordingEmbeddings();
const batched = await embedInBatches(fake, ["a", "bb", "ccc", "dddd", "eeeee"], 2);
const sequential = new RecordingEmbeddings();
await embedInBatches(sequential, ["a", "b", "c", "d"], 1);
const empty = new RecordingEmbeddings();
const emptyOut = await embedInBatches(empty, [], 3);
const throws = (fn: () => void): string => {
  try {
    fn();
    return "";
  } catch (e) {
    return (e as Error).message;
  }
};

check("chunked: แบ่งเป็นกลุ่ม กลุ่มสุดท้ายอาจสั้นกว่า รายการว่างได้อาร์เรย์ว่าง", JSON.stringify(chunked([1, 2, 3, 4, 5], 2)) === "[[1,2],[3,4],[5]]" && JSON.stringify(chunked([1, 2], 5)) === "[[1,2]]" && chunked([], 3).length === 0);
check("chunked: ขนาดกลุ่มต้องมากกว่า 0", throws(() => chunked([1], 0)).includes("batchSize") && throws(() => chunked([1], -1)).includes("batchSize"));
check("embedInBatches: ส่งทีละกลุ่ม ผลเรียงตามข้อความเดิม", JSON.stringify(fake.batches.map((b) => b.length)) === "[2,2,1]" && JSON.stringify(batched.map((v) => v[0])) === "[1,2,3,4,5]");
check("embedInBatches: ส่งตามลำดับ ไม่ส่งซ้อนกัน", sequential.maxActive === 1, "ใช้ await ใน for ไม่ใช่ Promise.all");
check("embedInBatches: ไม่มีข้อความ = ไม่เรียก embedding เลย", emptyOut.length === 0 && empty.batches.length === 0);
check("assertDimensions: ผ่านเมื่อมิติถูก และบอกตัวแรกที่ผิดพร้อมตัวเลข", throws(() => assertDimensions([[1, 2], [3, 4]], 2)) === "" && throws(() => assertDimensions([[1, 2], [3], [4, 5, 6]], 2)) === "เวกเตอร์ตัวที่ 1 มี 1 มิติ แต่ต้องเป็น 2");
check("embedding จริง: เวกเตอร์มิติถูก และเอกสารรหัสผ่านได้คะแนนสูงสุด", scores[0] > scores[1] && scores[0] > scores[2], "ตรวจ GOOGLE_API_KEY ใน .env");
