import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { Chunk } from "@src/rag";
import { todo } from "@src/todo";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-17  (ไม่ใช้ LLM)
// chunking: เอกสารยาวต้องหั่นเป็นชิ้นเล็กก่อนทำ embedding แต่ละชิ้นพก "ที่มา" (source) ไปด้วย และชิ้นติดกันซ้อนกันเล็กน้อย (overlap) ประโยคจะได้ไม่ขาดตรงรอยต่อ
const CHUNK_SIZE = 60;
const CHUNK_OVERLAP = 10;

// 👉 ข้อ 1: สร้างตัวหั่น: new RecursiveCharacterTextSplitter({ chunkSize: CHUNK_SIZE, chunkOverlap: CHUNK_OVERLAP })
const splitter = todo(1);

// แปลงเอกสารทั้งชุดเป็น chunk โดยทุกชิ้นพก source เดิมของเอกสารไปด้วย
async function toChunks(docs: Chunk[]): Promise<Chunk[]> {
  const out: Chunk[] = [];
  for (const doc of docs) {
    // 👉 ข้อ 2: pieces = await splitter.splitText(doc.text) แล้ว push { text: ชิ้น, source: doc.source } ของทุกชิ้นลง out
    todo(2);
  }
  return out;
}

// ใช้ข้อความอังกฤษเพราะมีช่องว่างให้ตัดเห็นชัด
const long = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega";
const short = await toChunks([{ source: "a.md", text: "สั้น ๆ" }]);
const longOut = await toChunks([{ source: "g.md", text: long }]);
const mixed = await toChunks([
  { source: "one.md", text: long },
  { source: "two.md", text: "short" },
]);
console.log(longOut.map((c) => c.text));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("เอกสารสั้น: ได้ชิ้นเดียวและพก source", short.length === 1 && short[0].text === "สั้น ๆ" && short[0].source === "a.md");
check("เอกสารยาว: แบ่งเป็นหลายชิ้น แต่ละชิ้นไม่เกิน chunkSize", longOut.length > 1 && longOut.every((c) => c.text.length <= CHUNK_SIZE), "ตั้ง chunkSize: CHUNK_SIZE");
check("ทุกชิ้นพก source ของเอกสารตัวเอง (หลายเอกสารไม่ปนกัน)", mixed.filter((c) => c.source === "one.md").length > 1 && mixed.filter((c) => c.source === "two.md").length === 1 && mixed.find((c) => c.source === "two.md")?.text === "short");
const joined = longOut.map((c) => c.text).join(" ");
check("ไม่มีเนื้อหาหาย และชิ้นติดกันซ้อนกัน (overlap)", long.split(" ").every((w) => joined.includes(w)) && longOut[1].text.includes(longOut[0].text.split(" ").pop()!), "ตั้ง chunkOverlap: CHUNK_OVERLAP");
