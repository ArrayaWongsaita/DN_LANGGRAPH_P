import { todo } from "@src/todo";

export interface Doc {
  id: string;
  text: string;
}

// อันดับด้วยคำ: ตัด query เป็นคำด้วยช่องว่าง (ตัวพิมพ์เล็ก) นับว่ามีกี่คำที่ปรากฏใน text (ตัวพิมพ์เล็ก)
export function keywordRank(docs: Doc[], query: string): string[] {
  // 👉 ข้อ 1: เก็บเฉพาะเอกสารที่ตรงอย่างน้อย 1 คำ เรียงจากจำนวนคำที่ตรงมากไปน้อย
  //          ถ้าเท่ากันให้คงลำดับเดิมของ docs แล้วคืนรายการ id
  return todo(1);
}

// รวมหลายรายการอันดับ (แต่ละรายการคือ id เรียงจากดีที่สุด) ด้วย Reciprocal Rank Fusion
export function reciprocalRankFusion(rankings: string[][], k = 60): string[] {
  // 👉 ข้อ 2: คะแนนของแต่ละ id = ผลรวมของ 1 / (k + อันดับ) โดยอันดับนับจาก 1 ในทุกรายการที่ id นั้นอยู่
  //          เรียงคะแนนมากไปน้อย ถ้าเท่ากันให้ id ที่ปรากฏก่อน (ตามลำดับรายการแล้วลำดับในรายการ) มาก่อน
  return todo(2);
}

export function hybridSearch(docs: Doc[], query: string, vectorRanking: string[], topN: number): string[] {
  // 👉 ข้อ 3: รวม keywordRank(docs, query) กับ vectorRanking ด้วย reciprocalRankFusion แล้วเอา topN อันดับแรก
  return todo(3);
}
