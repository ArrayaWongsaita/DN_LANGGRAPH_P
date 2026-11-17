import type { Embeddings } from "@langchain/core/embeddings";
import { todo } from "@src/todo";

// แบ่ง items เป็นกลุ่มละ size ตัว (กลุ่มสุดท้ายอาจน้อยกว่า)
export function chunked<T>(items: T[], size: number): T[][] {
  // 👉 ข้อ 1: ถ้า size < 1 ให้ throw new Error("batchSize ต้องมากกว่า 0")
  //          ไม่เช่นนั้นคืนอาร์เรย์ของกลุ่ม เช่น chunked([1,2,3,4,5], 2) = [[1,2],[3,4],[5]] (รายการว่างได้ [])
  return todo(1);
}

// embed ทีละกลุ่ม "ตามลำดับ" (ไม่ส่งพร้อมกัน) แล้วรวมผลเรียงตามข้อความ
export async function embedInBatches(embeddings: Embeddings, texts: string[], batchSize: number): Promise<number[][]> {
  // 👉 ข้อ 2: วนแต่ละกลุ่มจาก chunked(texts, batchSize) เรียก await embeddings.embedDocuments(กลุ่ม)
  //          แล้วต่อผลลัพธ์เข้าด้วยกัน (ไม่มีข้อความ = ไม่เรียก embedding เลย)
  return todo(2);
}

export function assertDimensions(vectors: number[][], dims: number): void {
  // 👉 ข้อ 3: ถ้ามีเวกเตอร์ตัวใดยาวไม่เท่า dims ให้ throw new Error(`เวกเตอร์ตัวที่ ${i} มี ${จริง} มิติ แต่ต้องเป็น ${dims}`)
  //          (i นับจาก 0 ตัวแรกที่ผิด)
  todo(3);
}
