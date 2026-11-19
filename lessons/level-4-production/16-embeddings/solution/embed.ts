import type { Embeddings } from "@langchain/core/embeddings";
import { KeywordEmbeddings } from "@src/rag";
import { getEmbeddings } from "@src/embeddings";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-16  (ส่วนสุดท้ายเรียก embedding จริง ต้องมี GOOGLE_API_KEY ใน .env)
// embedding แปลงข้อความเป็นเวกเตอร์ ข้อความความหมายใกล้กันได้เวกเตอร์ที่ชี้ไปทางเดียวกัน วัดด้วย cosine similarity แล้วเรียงเอกสารตามความใกล้

function cosineSimilarity(a: number[], b: number[]): number {
  // ข้อ 1: dot = ผลรวม a[i]*b[i]; |a| = รากที่สองของผลรวม a[i]^2 (เช่นเดียวกับ |b|)
  //          ถ้า |a| หรือ |b| เป็น 0 คืน 0 ไม่เช่นนั้นคืน dot / (|a| * |b|)
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

interface Ranked {
  text: string;
  score: number;
}

// เรียงเอกสารจากคล้ายคำถามมากไปน้อย แล้วเอา k อันดับแรก
async function rank(query: string, docs: string[], embeddings: Embeddings, k: number): Promise<Ranked[]> {
  // ข้อ 2: q = await embeddings.embedQuery(query); vectors = await embeddings.embedDocuments(docs)
  //          สร้าง { text, score: cosineSimilarity(q, vector) } ของทุกเอกสาร เรียง score มากไปน้อย แล้ว slice(0, k)
  const q = await embeddings.embedQuery(query);
  const vectors = await embeddings.embedDocuments(docs);
  const scored = docs.map((text, i) => ({ text, score: cosineSimilarity(q, vectors[i]) }));
  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}

// ส่วนที่ 1: embedding ปลอมที่นับคำสำคัญ (ผลแน่นอน อธิบายได้) ตรวจว่าสูตรถูก
const docs = ["ลืมรหัสผ่านให้รีเซ็ต", "คืนเงินได้ใน 7 วัน", "ลาป่วยได้ 30 วัน"];
const docsCopy = [...docs];
const top = await rank("ลืมรหัสผ่านทำไง", docs, new KeywordEmbeddings(), 3);
const limited = await rank("ลา", docs, new KeywordEmbeddings(), 2);

// ส่วนที่ 2: embedding จริง จับ "ความหมาย" ได้ แม้ไม่มีคำซ้ำกัน (ถามว่า "ลืมพาสเวิร์ด" เอกสารเขียนว่า "รหัสผ่าน")
const semantic = await rank("ลืมพาสเวิร์ดทำยังไง", docs, getEmbeddings(), 3);
console.log("embedding จริง:", semantic.map((r) => `${r.score.toFixed(2)} ${r.text}`));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("cosine: ทิศเดียวกัน 1, ตั้งฉาก 0, ตรงข้าม -1", Math.abs(cosineSimilarity([1, 2, 3], [2, 4, 6]) - 1) < 1e-9 && cosineSimilarity([1, 0], [0, 1]) === 0 && Math.abs(cosineSimilarity([1, 1], [-1, -1]) + 1) < 1e-9);
check("cosine: เวกเตอร์ศูนย์คืน 0 ไม่ใช่ NaN", cosineSimilarity([0, 0, 0], [1, 2, 3]) === 0);
check("rank: เอกสารที่ตรงกับคำถามที่สุดมาก่อน", top[0].text === "ลืมรหัสผ่านให้รีเซ็ต" && top[0].score > top[1].score, "เรียง score มากไปน้อย");
check("rank: จำกัดจำนวนตาม k และไม่แก้อาร์เรย์เดิม", limited.length === 2 && JSON.stringify(docs) === JSON.stringify(docsCopy), "ใช้ docs.map(...) แล้วค่อย sort อย่า sort docs ตรง ๆ");
check("embedding จริง: จับความหมายได้ ลืมพาสเวิร์ด = เอกสารรหัสผ่าน", semantic[0].text === "ลืมรหัสผ่านให้รีเซ็ต", "ตรวจ GOOGLE_API_KEY ใน .env");
