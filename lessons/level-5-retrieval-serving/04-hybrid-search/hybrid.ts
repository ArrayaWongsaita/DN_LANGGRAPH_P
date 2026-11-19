import { todo } from "@src/todo";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-04  (ไม่ใช้ LLM ไม่ใช้ฐานข้อมูล)
// hybrid search: ค้นด้วย "คำ" (เจอรหัสสินค้า/ชื่อเฉพาะแม่น) + ค้นด้วย "เวกเตอร์" (เจอความหมาย) แล้วรวมอันดับด้วย Reciprocal Rank Fusion (RRF) เอกสารที่อยู่ในหลายรายการได้คะแนนสะสม
interface Doc {
  id: string;
  text: string;
}

// อันดับด้วยคำ: ตัด query เป็นคำด้วยช่องว่าง (ตัวพิมพ์เล็ก) นับว่ามีกี่คำที่ปรากฏใน text (ตัวพิมพ์เล็ก)
function keywordRank(docs: Doc[], query: string): string[] {
  // 👉 ข้อ 1: เก็บเฉพาะเอกสารที่ตรงอย่างน้อย 1 คำ เรียงจากจำนวนคำที่ตรงมากไปน้อย
  //          ถ้าเท่ากันให้คงลำดับเดิมของ docs แล้วคืนรายการ id
  return todo(1);
}

// รวมหลายรายการอันดับ (แต่ละรายการคือ id เรียงจากดีที่สุด) ด้วย Reciprocal Rank Fusion
function reciprocalRankFusion(rankings: string[][], k = 60): string[] {
  // 👉 ข้อ 2: คะแนนของแต่ละ id = ผลรวมของ 1 / (k + อันดับ) โดยอันดับนับจาก 1 ในทุกรายการที่ id นั้นอยู่
  //          เรียงคะแนนมากไปน้อย ถ้าเท่ากันให้ id ที่ปรากฏก่อน (ตามลำดับรายการแล้วลำดับในรายการ) มาก่อน
  return todo(2);
}

function hybridSearch(docs: Doc[], query: string, vectorRanking: string[], topN: number): string[] {
  // 👉 ข้อ 3: รวม keywordRank(docs, query) กับ vectorRanking ด้วย reciprocalRankFusion แล้วเอา topN อันดับแรก
  return todo(3);
}

const docs: Doc[] = [
  { id: "a", text: "คู่มือสินค้า AX-4421 การติดตั้ง" },
  { id: "b", text: "นโยบายคืนเงินสินค้า" },
  { id: "c", text: "วิธีติดตั้ง VPN และรีเซ็ตรหัสผ่าน" },
  { id: "d", text: "ติดตั้ง ติดตั้ง ติดตั้ง" },
];
// สมมติเวกเตอร์ไม่รู้จักรหัสสินค้า AX-4421 เลย (ตอบแต่ b, c) แต่การค้นด้วยคำเจอ
const hybrid = hybridSearch(docs, "AX-4421", ["b", "c"], 3);
console.log("ค้นด้วยคำอย่างเดียว:", keywordRank(docs, "AX-4421"), "→ ผสม:", hybrid);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("keywordRank: นับคำที่ตรง ตัดอันที่ไม่ตรงเลย ไม่สนตัวพิมพ์", JSON.stringify(keywordRank(docs, "ax-4421")) === '["a"]' && JSON.stringify(keywordRank(docs, "vpn รีเซ็ตรหัสผ่าน")) === '["c"]' && keywordRank(docs, "ไม่มีคำนี้").length === 0);
check("keywordRank: ตรงมากคำกว่ามาก่อน เท่ากันคงลำดับเดิม", JSON.stringify(keywordRank(docs, "ติดตั้ง สินค้า")) === '["a","b","c","d"]', "d มีคำซ้ำแต่นับเป็นหนึ่งคำที่ตรง");
check("RRF: อยู่ในสองรายการชนะเป็นที่หนึ่งของรายการเดียว", JSON.stringify(reciprocalRankFusion([["a", "b"], ["b", "c"]])) === '["b","a","c"]');
check("RRF: คำนวณตามสูตรจริง (k=1 และ k ใหญ่)", JSON.stringify(reciprocalRankFusion([["a", "b", "c"], ["b", "a"]], 1)) === '["a","b","c"]' && reciprocalRankFusion([["x", "y"], ["z", "y"]], 1000)[0] === "y", "1 / (k + อันดับ) โดยอันดับเริ่มที่ 1");
check("RRF: คะแนนเท่ากันให้ตัวที่ปรากฏก่อนมาก่อน และรายการว่างได้ว่าง", JSON.stringify(reciprocalRankFusion([["a"], ["b"]])) === '["a","b"]' && reciprocalRankFusion([]).length === 0 && reciprocalRankFusion([[], []]).length === 0);
check("hybridSearch: เอกสารที่เจอแค่ด้วยคำ (รหัสสินค้า) ยังขึ้นมาแม้เวกเตอร์ไม่เจอ", hybrid.includes("a"));
const both = hybridSearch(docs, "vpn", ["c", "b"], 2);
check("hybridSearch: จำกัดด้วย topN และเอกสารที่ทั้งสองระบบเห็นตรงกันมาก่อน", both.length === 2 && both[0] === "c");
