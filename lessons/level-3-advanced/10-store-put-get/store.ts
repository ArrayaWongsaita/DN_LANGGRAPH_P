import { InMemoryStore } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-10  (ไม่ใช้ LLM)
// Store = ที่เก็บความจำ "ระยะยาว" ที่ใช้ข้ามทุก thread (ต่างจาก checkpointer ที่เก็บต่อ thread): จัดเป็น namespace + key + value
const store = new InMemoryStore();
const profile = { name: "มาลี", lang: "th" };

// 👉 ข้อ 1: เก็บโปรไฟล์: await store.put(["profiles"], "mali", profile)  (namespace ["profiles"], key "mali")
todo(1);

// 👉 ข้อ 2: อ่านกลับ: const item = await store.get(["profiles"], "mali") ได้ item (หรือ null ถ้าไม่มี) ใช้ item?.value
const found: typeof profile | undefined = todo(2);
const missing = await store.get(["profiles"], "ไม่มีคนนี้");
console.log({ found, missing });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("อ่านโปรไฟล์ที่เก็บไว้ได้ตรงกัน", found?.name === "มาลี" && found.lang === "th", "store.put แล้ว store.get ด้วย namespace และ key เดียวกัน");
check("key ที่ไม่มีได้ค่าว่าง (null)", missing == null);
