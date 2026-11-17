import { hybridSearch, keywordRank, reciprocalRankFusion } from "./hybrid";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const docs = [
  { id: "a", text: "คู่มือสินค้า AX-4421 การติดตั้ง" },
  { id: "b", text: "นโยบายคืนเงินสินค้า" },
  { id: "c", text: "วิธีติดตั้ง VPN และรีเซ็ตรหัสผ่าน" },
  { id: "d", text: "ติดตั้ง ติดตั้ง ติดตั้ง" },
];

test("keywordRank: นับคำที่ตรง ตัดอันที่ไม่ตรงเลย ไม่สนตัวพิมพ์", () => {
  expect(keywordRank(docs, "ax-4421")).toEqual(["a"]);
  expect(keywordRank(docs, "vpn รีเซ็ตรหัสผ่าน")).toEqual(["c"]);
  expect(keywordRank(docs, "ไม่มีคำนี้")).toEqual([]);
});

test("keywordRank: ตรงมากคำกว่ามาก่อน และเท่ากันคงลำดับเดิม", () => {
  // a ตรง 2 คำ (ติดตั้ง, สินค้า) ส่วน b, c, d ตรงคนละ 1 คำ (d มีคำซ้ำแต่นับเป็น 1 คำที่ตรง) เท่ากันคงลำดับเดิม
  expect(keywordRank(docs, "ติดตั้ง สินค้า")).toEqual(["a", "b", "c", "d"]);
});

test("reciprocalRankFusion: อยู่ในสองรายการชนะเป็นที่หนึ่งของรายการเดียว", () => {
  expect(reciprocalRankFusion([["a", "b"], ["b", "c"]])).toEqual(["b", "a", "c"]);
});

test("reciprocalRankFusion: คำนวณตามสูตรจริง (ไม่ใช่แค่ลำดับที่บังเอิญตรง)", () => {
  // k=1: a = 1/2 + 1/3, b = 1/3 + 1/2 เท่ากัน  c = 1/4  → a มาก่อนเพราะปรากฏก่อน
  expect(reciprocalRankFusion([["a", "b", "c"], ["b", "a"]], 1)).toEqual(["a", "b", "c"]);
  // k ใหญ่ทำให้ลำดับต้นรายการต่างกันน้อย: อยู่ทั้งสองรายการยังชนะ
  expect(reciprocalRankFusion([["x", "y"], ["z", "y"]], 1000)[0]).toBe("y");
});

test("reciprocalRankFusion: คะแนนเท่ากันให้ตัวที่ปรากฏก่อนมาก่อน และรายการว่างได้ว่าง", () => {
  expect(reciprocalRankFusion([["a"], ["b"]])).toEqual(["a", "b"]);
  expect(reciprocalRankFusion([])).toEqual([]);
  expect(reciprocalRankFusion([[], []])).toEqual([]);
});

test("hybridSearch: เอกสารที่เจอแค่ด้วยคำ (รหัสสินค้า) ยังขึ้นมาแม้เวกเตอร์ไม่เจอ", () => {
  expect(hybridSearch(docs, "AX-4421", ["b", "c"], 3)).toContain("a");
});

test("hybridSearch: จำกัดด้วย topN และเอกสารที่ทั้งสองระบบเห็นตรงกันมาก่อน", () => {
  const out = hybridSearch(docs, "vpn", ["c", "b"], 2);
  expect(out).toHaveLength(2);
  expect(out[0]).toBe("c");
});
