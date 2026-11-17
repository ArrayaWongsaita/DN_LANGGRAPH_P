import { fakeToolLLM } from "@src/fakeToolLLM";
import { buildResearch } from "./research";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) สคริปต์: แผน(JSON) → โน้ตต่อหัวข้อ → เขียน → ตรวจ(JSON) → (เขียน → ตรวจ)...
const plan = (topics: string[]) => JSON.stringify({ topics });
const reject = (f: string) => JSON.stringify({ approved: false, feedback: f });
const accept = JSON.stringify({ approved: true, feedback: "" });

test("สายเต็ม: วางแผน ค้นขนาน เขียน ตรวจผ่านรอบแรก", async () => {
  const llm = fakeToolLLM([plan(["ก", "ข"]), "โน้ต1", "โน้ต2", "รายงานฉบับแรก", accept]);
  const r = await buildResearch(llm).invoke({ question: "ทำไมฟ้าสีฟ้า" });
  expect(r.topics).toEqual(["ก", "ข"]);
  expect([...r.notes].sort()).toEqual(["โน้ต1", "โน้ต2"]);
  expect(r.report).toBe("รายงานฉบับแรก");
  expect(r.round).toBe(1);
  expect(r.approved).toBe(true);
});

test("ขั้นเขียนเห็นโน้ตทุกหัวข้อ", async () => {
  const llm = fakeToolLLM([plan(["ก", "ข"]), "โน้ตก", "โน้ตข", "รายงาน", accept]);
  await buildResearch(llm).invoke({ question: "q" });
  const writePrompt = llm.calls[3][0].text;
  expect(writePrompt).toContain("โน้ตก");
  expect(writePrompt).toContain("โน้ตข");
});

test("ไม่ผ่านรอบแรก: เขียนใหม่โดยแนบข้อติ แล้วผ่านรอบสอง", async () => {
  const llm = fakeToolLLM([plan(["ก"]), "โน้ต", "ร่าง1", reject("ขาดตัวอย่าง"), "ร่าง2", accept]);
  const r = await buildResearch(llm).invoke({ question: "q" });
  expect(r.round).toBe(2);
  expect(r.report).toBe("ร่าง2");
  expect(llm.calls[4][0].text).toContain("ขาดตัวอย่าง");
});

test("ไม่ผ่านตลอด: หยุดที่ 3 รอบ", async () => {
  const llm = fakeToolLLM([plan(["ก"]), "โน้ต", "ร่าง1", reject("ก"), "ร่าง2", reject("ข"), "ร่าง3", reject("ค")]);
  const r = await buildResearch(llm).invoke({ question: "q" });
  expect(r.round).toBe(3);
  expect(r.approved).toBe(false);
});

test("จำกัดหัวข้อไม่เกิน 4 แม้ LLM แตกมาเยอะ", async () => {
  const llm = fakeToolLLM([plan(["1", "2", "3", "4", "5", "6"]), ...Array(4).fill("โน้ต"), "รายงาน", accept]);
  const r = await buildResearch(llm).invoke({ question: "q" });
  expect(r.topics).toHaveLength(4);
  expect(r.notes).toHaveLength(4);
});
