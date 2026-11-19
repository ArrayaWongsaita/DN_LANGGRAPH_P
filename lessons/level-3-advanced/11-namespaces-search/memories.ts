import { randomUUID } from "node:crypto";
import { InMemoryStore } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-11  (ไม่ใช้ LLM)
// namespace แยกความจำต่อผู้ใช้ (["memories", userId]) และ search ดึงทุกรายการใน namespace นั้นกลับมา
const store = new InMemoryStore();
const memories: [string, string][] = [
  ["mali", "ชอบกาแฟ"],
  ["mali", "แพ้ถั่ว"],
  ["somchai", "ชอบชา"],
];

for (const [userId, text] of memories) {
  const key = randomUUID();
  // 👉 ข้อ 1: จำเรื่องนี้ไว้ใน namespace ของผู้ใช้: await store.put(["memories", userId], key, { text })
  todo(1);
}

// 👉 ข้อ 2: ดึงความจำทั้งหมดของ mali: items = await store.search(["memories", "mali"]) แล้ว map ให้เหลือ i.value.text
const mali: string[] = todo(2);
const somchai = (await store.search(["memories", "somchai"])).map((i) => i.value.text as string);
console.log({ mali, somchai });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ดึงความจำของ mali ได้ครบสองข้อ", JSON.stringify([...mali].sort()) === JSON.stringify(["ชอบกาแฟ", "แพ้ถั่ว"].sort()), "search ด้วย namespace [\"memories\", \"mali\"]");
check("ความจำของ somchai แยกจากของ mali", JSON.stringify(somchai) === '["ชอบชา"]');
