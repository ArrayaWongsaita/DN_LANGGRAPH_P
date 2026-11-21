import { createHash } from "node:crypto";
import { Embeddings } from "@langchain/core/embeddings";
import { todo } from "@src/todo";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-06  (ไม่ใช้ LLM ไม่ใช้ฐานข้อมูล: ตารางและ embedding เป็นของจำลองที่จดว่าถูกเรียกอะไรบ้าง)
// นำเข้าเอกสารแบบ idempotent: รันซ้ำกี่รอบผลเหมือนเดิม ไม่มีแถวซ้ำ และ embed (ซึ่งเสียเงิน/เสียเวลา) เฉพาะชิ้นที่เปลี่ยนจริง หลักการคือ id ของชิ้น = hash ของเนื้อหา
interface Row {
  id: string;
  docId: string;
  text: string;
}

interface Table {
  idsForDoc(docId: string): Promise<string[]>;
  upsert(items: { row: Row; vector: number[] }[]): Promise<void>;
  remove(ids: string[]): Promise<void>;
}

function chunkId(docId: string, text: string): string {
  return `${docId}:${createHash("sha256").update(text).digest("hex").slice(0, 16)}`;
}

interface Plan {
  toAdd: Row[];
  toRemove: string[];
  unchanged: number;
}

// เทียบ id ที่มีอยู่ในตารางกับแถวที่ต้องการให้มี
function planSync(existingIds: string[], wanted: Row[]): Plan {
  // 👉 ข้อ 1 toAdd = แถวใน wanted ที่ id ยังไม่มีใน existingIds
  //          toRemove = id ใน existingIds ที่ไม่มีใน wanted  unchanged = จำนวนแถวใน wanted ที่ id มีอยู่แล้ว
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   const existing = new Set(existingIds);
  //   const wantedIds = new Set(wanted.map((r) => r.id));
  //   return {
  //     toAdd: wanted.filter((r) => !existing.has(r.id)),
  //     toRemove: existingIds.filter((id) => !wantedIds.has(id)),
  //     unchanged: wanted.filter((r) => existing.has(r.id)).length,
  //   };
  return todo(1);
}

async function ingestDoc(
  table: Table,
  embeddings: Embeddings,
  docId: string,
  chunks: string[],
): Promise<{ added: number; removed: number; unchanged: number }> {
  const unique = new Map<string, Row>();
  for (const text of chunks) unique.set(chunkId(docId, text), { id: chunkId(docId, text), docId, text });
  const wanted = [...unique.values()];
  const plan = planSync(await table.idsForDoc(docId), wanted);
  if (plan.toAdd.length > 0) {
    const vectors = await embeddings.embedDocuments(plan.toAdd.map((r) => r.text));
    await table.upsert(plan.toAdd.map((row, i) => ({ row, vector: vectors[i] })));
  }
  if (plan.toRemove.length > 0) await table.remove(plan.toRemove);
  return { added: plan.toAdd.length, removed: plan.toRemove.length, unchanged: plan.unchanged };
}

// ตารางในหน่วยความจำ + embedding ที่จดว่าถูกขอ embed ข้อความอะไร
class CountingEmbeddings extends Embeddings {
  embedded: string[] = [];
  calls = 0;
  constructor() {
    super({});
  }
  async embedQuery(t: string) {
    return [t.length];
  }
  async embedDocuments(texts: string[]) {
    this.calls++;
    this.embedded.push(...texts);
    return texts.map((t) => [t.length]);
  }
}

class MemTable implements Table {
  rows = new Map<string, Row>();
  async idsForDoc(docId: string) {
    return [...this.rows.values()].filter((r) => r.docId === docId).map((r) => r.id);
  }
  async upsert(items: { row: Row; vector: number[] }[]) {
    for (const { row } of items) this.rows.set(row.id, row);
  }
  async remove(ids: string[]) {
    for (const id of ids) this.rows.delete(id);
  }
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// เล่นสถานการณ์ต่อเนื่อง: นำเข้าครั้งแรก → ซ้ำโดยไม่แก้ → แก้หนึ่งชิ้น → ลบบางส่วน
const table = new MemTable();
const emb = new CountingEmbeddings();
const first = await ingestDoc(table, emb, "d1", ["ก", "ข", "ค"]);
const firstEmbedded = [...emb.embedded];
const sizeAfterFirst = table.rows.size;
emb.calls = 0;
const again = await ingestDoc(table, emb, "d1", ["ก", "ข", "ค"]);
const againCalls = emb.calls;
emb.embedded = [];
const edited = await ingestDoc(table, emb, "d1", ["ก", "ข แก้แล้ว", "ค"]);
const editedEmbedded = [...emb.embedded];
const texts = [...table.rows.values()].map((r) => r.text).sort();
emb.calls = 0;
const shrunk = await ingestDoc(table, emb, "d1", ["ก", "ค"]);
const shrunkCalls = emb.calls;
console.log({ first, again, edited, shrunk });

// ข้อความซ้ำในเอกสารเดียว และหลายเอกสาร
const t2 = new MemTable();
const e2 = new CountingEmbeddings();
const dup = await ingestDoc(t2, e2, "d1", ["ซ้ำ", "ซ้ำ", "อื่น"]);
const t3 = new MemTable();
const e3 = new CountingEmbeddings();
await ingestDoc(t3, e3, "d1", ["เหมือนกัน"]);
await ingestDoc(t3, e3, "d2", ["เหมือนกัน"]);
const twoDocs = t3.rows.size;
await ingestDoc(t3, e3, "d1", []);
const remaining = [...t3.rows.values()].map((r) => r.docId);
const wanted: Row[] = [
  { id: "a", docId: "d", text: "A" },
  { id: "b", docId: "d", text: "B" },
];












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("chunkId: คงที่สำหรับข้อความเดิม ต่างกันเมื่อข้อความหรือเอกสารต่าง", chunkId("d1", "สวัสดี") === chunkId("d1", "สวัสดี") && chunkId("d1", "สวัสดี") !== chunkId("d1", "สวัสดีครับ") && chunkId("d1", "สวัสดี") !== chunkId("d2", "สวัสดี") && /^d1:[0-9a-f]{16}$/.test(chunkId("d1", "x")));
check("planSync: แยกเพิ่ม/ลบ/คงเดิมถูกต้อง", same(planSync(["b", "c"], wanted), { toAdd: [wanted[0]], toRemove: ["c"], unchanged: 1 }) && planSync([], wanted).toAdd.length === 2 && same(planSync(["a", "b"], wanted), { toAdd: [], toRemove: [], unchanged: 2 }));
check("นำเข้าครั้งแรก: embed และเพิ่มทุกชิ้น", same(first, { added: 3, removed: 0, unchanged: 0 }) && sizeAfterFirst === 3 && same(firstEmbedded, ["ก", "ข", "ค"]));
check("นำเข้าซ้ำโดยไม่แก้อะไร: ไม่เรียก embedding และไม่ซ้ำ", same(again, { added: 0, removed: 0, unchanged: 3 }) && againCalls === 0 && sizeAfterFirst === 3);
check("แก้หนึ่งชิ้น: embed เฉพาะชิ้นใหม่ และลบชิ้นเก่าของมัน", same(edited, { added: 1, removed: 1, unchanged: 2 }) && same(editedEmbedded, ["ข แก้แล้ว"]) && same(texts, ["ก", "ข แก้แล้ว", "ค"].sort()));
check("ลบบางส่วนออกจากเอกสาร: ชิ้นที่หายถูกลบ และไม่ต้อง embed อะไร", same(shrunk, { added: 0, removed: 1, unchanged: 2 }) && shrunkCalls === 0);
check("ข้อความซ้ำในเอกสารเดียวกันเก็บแถวเดียว (และ embed ครั้งเดียว)", same(dup, { added: 2, removed: 0, unchanged: 0 }) && same(e2.embedded, ["ซ้ำ", "อื่น"]));
check("หลายเอกสารไม่ปนกัน: การนำเข้าเอกสารหนึ่งไม่ลบของอีกเอกสาร", twoDocs === 2 && same(remaining, ["d2"]));
