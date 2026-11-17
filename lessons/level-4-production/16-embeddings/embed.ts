import type { Embeddings } from "@langchain/core/embeddings";
import { todo } from "@src/todo";

export function cosineSimilarity(a: number[], b: number[]): number {
  // 👉 ข้อ 1: dot = ผลรวม a[i]*b[i]; |a| = รากที่สองของผลรวม a[i]^2 (เช่นเดียวกับ |b|)
  //          ถ้า |a| หรือ |b| เป็น 0 คืน 0 ไม่เช่นนั้นคืน dot / (|a| * |b|)
  return todo(1);
}

export interface Ranked {
  text: string;
  score: number;
}

// เรียงเอกสารจากคล้ายคำถามมากไปน้อย แล้วเอา k อันดับแรก
export async function rank(query: string, docs: string[], embeddings: Embeddings, k: number): Promise<Ranked[]> {
  // 👉 ข้อ 2: q = await embeddings.embedQuery(query); vectors = await embeddings.embedDocuments(docs)
  //          สร้าง { text, score: cosineSimilarity(q, vector) } ของทุกเอกสาร เรียง score มากไปน้อย แล้ว slice(0, k)
  return todo(2);
}
