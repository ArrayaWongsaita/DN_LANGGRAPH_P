import { createHash } from "node:crypto";
import type { Embeddings } from "@langchain/core/embeddings";
import { todo } from "@src/todo";

export interface Row {
  id: string;
  docId: string;
  text: string;
}

export interface Table {
  idsForDoc(docId: string): Promise<string[]>;
  upsert(items: { row: Row; vector: number[] }[]): Promise<void>;
  remove(ids: string[]): Promise<void>;
}

export function chunkId(docId: string, text: string): string {
  // 👉 ข้อ 1: คืน `${docId}:${hash}` โดย hash คือ 16 ตัวแรกของ sha256 (hex) ของ text
  //          ใช้ createHash("sha256").update(text).digest("hex").slice(0, 16)
  return todo(1);
}

export interface Plan {
  toAdd: Row[];
  toRemove: string[];
  unchanged: number;
}

// เทียบ id ที่มีอยู่ในตารางกับแถวที่ต้องการให้มี
export function planSync(existingIds: string[], wanted: Row[]): Plan {
  // 👉 ข้อ 2: toAdd = แถวใน wanted ที่ id ยังไม่มีใน existingIds
  //          toRemove = id ใน existingIds ที่ไม่มีใน wanted  unchanged = จำนวนแถวใน wanted ที่ id มีอยู่แล้ว
  return todo(2);
}

export async function ingestDoc(
  table: Table,
  embeddings: Embeddings,
  docId: string,
  chunks: string[],
): Promise<{ added: number; removed: number; unchanged: number }> {
  // 👉 ข้อ 3: wanted = chunks แปลงเป็น Row (id จาก chunkId) โดยข้อความซ้ำในเอกสารเดียวกันเก็บแถวเดียว
  //          existing = await table.idsForDoc(docId); plan = planSync(existing, wanted)
  //          ถ้า plan.toAdd ไม่ว่าง: vectors = await embeddings.embedDocuments(ข้อความของ toAdd) แล้ว table.upsert
  //          ถ้า plan.toRemove ไม่ว่าง: await table.remove(plan.toRemove)   (ไม่มีอะไรต้องเพิ่ม = ไม่เรียก embedding)
  //          คืน { added: จำนวน toAdd, removed: จำนวน toRemove, unchanged }
  return todo(3);
}
