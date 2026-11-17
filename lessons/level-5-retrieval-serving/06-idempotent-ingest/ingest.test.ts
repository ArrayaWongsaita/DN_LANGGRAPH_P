import { Embeddings } from "@langchain/core/embeddings";
import { type Row, type Table, chunkId, ingestDoc, planSync } from "./ingest";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ตารางในหน่วยความจำ + embedding ที่จดว่าถูกขอ embed ข้อความอะไร
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

test("chunkId: คงที่สำหรับข้อความเดิม ต่างกันเมื่อข้อความหรือเอกสารต่าง", () => {
  expect(chunkId("d1", "สวัสดี")).toBe(chunkId("d1", "สวัสดี"));
  expect(chunkId("d1", "สวัสดี")).not.toBe(chunkId("d1", "สวัสดีครับ"));
  expect(chunkId("d1", "สวัสดี")).not.toBe(chunkId("d2", "สวัสดี"));
  expect(chunkId("d1", "x")).toMatch(/^d1:[0-9a-f]{16}$/);
});

test("planSync: แยกเพิ่ม/ลบ/คงเดิมถูกต้อง", () => {
  const wanted: Row[] = [
    { id: "a", docId: "d", text: "A" },
    { id: "b", docId: "d", text: "B" },
  ];
  expect(planSync(["b", "c"], wanted)).toEqual({ toAdd: [wanted[0]], toRemove: ["c"], unchanged: 1 });
  expect(planSync([], wanted).toAdd).toHaveLength(2);
  expect(planSync(["a", "b"], wanted)).toEqual({ toAdd: [], toRemove: [], unchanged: 2 });
});

test("นำเข้าครั้งแรก: embed และเพิ่มทุกชิ้น", async () => {
  const table = new MemTable();
  const emb = new CountingEmbeddings();
  expect(await ingestDoc(table, emb, "d1", ["ก", "ข", "ค"])).toEqual({ added: 3, removed: 0, unchanged: 0 });
  expect(table.rows.size).toBe(3);
  expect(emb.embedded).toEqual(["ก", "ข", "ค"]);
});

test("นำเข้าซ้ำโดยไม่แก้อะไร: ไม่เรียก embedding เลย และไม่ซ้ำ", async () => {
  const table = new MemTable();
  const emb = new CountingEmbeddings();
  await ingestDoc(table, emb, "d1", ["ก", "ข"]);
  emb.calls = 0;
  expect(await ingestDoc(table, emb, "d1", ["ก", "ข"])).toEqual({ added: 0, removed: 0, unchanged: 2 });
  expect(emb.calls).toBe(0);
  expect(table.rows.size).toBe(2);
});

test("แก้หนึ่งชิ้น: embed เฉพาะชิ้นใหม่ และลบชิ้นเก่าของมัน", async () => {
  const table = new MemTable();
  const emb = new CountingEmbeddings();
  await ingestDoc(table, emb, "d1", ["ก", "ข", "ค"]);
  emb.embedded = [];
  expect(await ingestDoc(table, emb, "d1", ["ก", "ข แก้แล้ว", "ค"])).toEqual({ added: 1, removed: 1, unchanged: 2 });
  expect(emb.embedded).toEqual(["ข แก้แล้ว"]);
  expect([...table.rows.values()].map((r) => r.text).sort()).toEqual(["ก", "ข แก้แล้ว", "ค"].sort());
});

test("ลบบางส่วนออกจากเอกสาร: ชิ้นที่หายถูกลบ และไม่ต้อง embed อะไร", async () => {
  const table = new MemTable();
  const emb = new CountingEmbeddings();
  await ingestDoc(table, emb, "d1", ["ก", "ข"]);
  emb.calls = 0;
  expect(await ingestDoc(table, emb, "d1", ["ก"])).toEqual({ added: 0, removed: 1, unchanged: 1 });
  expect(emb.calls).toBe(0);
});

test("ข้อความซ้ำในเอกสารเดียวกันเก็บแถวเดียว (และ embed ครั้งเดียว)", async () => {
  const table = new MemTable();
  const emb = new CountingEmbeddings();
  expect(await ingestDoc(table, emb, "d1", ["ซ้ำ", "ซ้ำ", "อื่น"])).toEqual({ added: 2, removed: 0, unchanged: 0 });
  expect(emb.embedded).toEqual(["ซ้ำ", "อื่น"]);
});

test("หลายเอกสารไม่ปนกัน: ข้อความเดียวกันต่างเอกสาร และการนำเข้าเอกสารหนึ่งไม่ลบของอีกเอกสาร", async () => {
  const table = new MemTable();
  const emb = new CountingEmbeddings();
  await ingestDoc(table, emb, "d1", ["เหมือนกัน"]);
  await ingestDoc(table, emb, "d2", ["เหมือนกัน"]);
  expect(table.rows.size).toBe(2);
  await ingestDoc(table, emb, "d1", []);
  expect([...table.rows.values()].map((r) => r.docId)).toEqual(["d2"]);
});
