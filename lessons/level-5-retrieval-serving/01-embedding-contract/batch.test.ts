import { Embeddings } from "@langchain/core/embeddings";
import { assertDimensions, chunked, embedInBatches } from "./batch";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) embedding ปลอมที่จดว่าถูกเรียกกี่ครั้ง กลุ่มละเท่าไร และซ้อนกันไหม
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

test("chunked: แบ่งเป็นกลุ่ม กลุ่มสุดท้ายอาจสั้นกว่า และรายการว่างได้อาร์เรย์ว่าง", () => {
  expect(chunked([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  expect(chunked([1, 2], 5)).toEqual([[1, 2]]);
  expect(chunked([], 3)).toEqual([]);
});

test("chunked: ขนาดกลุ่มต้องมากกว่า 0", () => {
  expect(() => chunked([1], 0)).toThrow("batchSize");
  expect(() => chunked([1], -1)).toThrow("batchSize");
});

test("embedInBatches: ส่งทีละกลุ่ม ผลเรียงตามข้อความเดิม", async () => {
  const e = new RecordingEmbeddings();
  const out = await embedInBatches(e, ["a", "bb", "ccc", "dddd", "eeeee"], 2);
  expect(e.batches.map((b) => b.length)).toEqual([2, 2, 1]);
  expect(out.map((v) => v[0])).toEqual([1, 2, 3, 4, 5]);
});

test("embedInBatches: ส่งทีละกลุ่มตามลำดับ ไม่ส่งซ้อนกัน", async () => {
  const e = new RecordingEmbeddings();
  await embedInBatches(e, ["a", "b", "c", "d"], 1);
  expect(e.maxActive).toBe(1);
});

test("embedInBatches: ไม่มีข้อความ = ไม่เรียก embedding เลย", async () => {
  const e = new RecordingEmbeddings();
  expect(await embedInBatches(e, [], 3)).toEqual([]);
  expect(e.batches).toEqual([]);
});

test("assertDimensions: ผ่านเมื่อมิติถูก และบอกตัวแรกที่ผิดพร้อมตัวเลข", () => {
  expect(() => assertDimensions([[1, 2], [3, 4]], 2)).not.toThrow();
  expect(() => assertDimensions([], 2)).not.toThrow();
  expect(() => assertDimensions([[1, 2], [3], [4, 5, 6]], 2)).toThrow("เวกเตอร์ตัวที่ 1 มี 1 มิติ แต่ต้องเป็น 2");
});
