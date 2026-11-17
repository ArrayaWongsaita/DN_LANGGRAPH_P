import { getEmbeddings, embeddingDimensions } from "@src/embeddings";
import { cosine } from "@src/rag";
import { assertDimensions, embedInBatches } from "./batch";

// ต้องตั้ง GOOGLE_API_KEY ใน .env (embedding จริง)
const embeddings = getEmbeddings();
const docs = ["ลืมรหัสผ่านให้รีเซ็ตที่พอร์ทัล IT", "สินค้าคืนเงินได้ภายใน 7 วัน", "ลาป่วยได้ปีละ 30 วัน"];
const vectors = await embedInBatches(embeddings, docs, 2);
assertDimensions(vectors, embeddingDimensions());
const query = await embeddings.embedQuery("ลืมพาสเวิร์ดทำยังไง");
assertDimensions([query], embeddingDimensions());
docs.forEach((doc, i) => console.log(cosine(query, vectors[i]).toFixed(3), doc));
console.log("(คำถามไม่มีคำซ้ำกับเอกสารแรกเลย แต่คะแนนสูงสุดควรเป็นเอกสารเรื่องรหัสผ่าน)");
