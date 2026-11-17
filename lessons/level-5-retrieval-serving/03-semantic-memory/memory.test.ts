import { InMemoryStore } from "@langchain/langgraph";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { KeywordEmbeddings } from "@src/rag";
import { buildMemoryBot, memoryNamespace, recall, remember } from "./memory";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) store ในหน่วยความจำ + embedding ปลอมที่นับคำ (ไม่ต้องมีฐานข้อมูลหรือ key)
const makeStore = () => new InMemoryStore({ index: { dims: 6, embeddings: new KeywordEmbeddings(), fields: ["text"] } } as never);

test("memoryNamespace: แยกตามผู้ใช้", () => {
  expect(memoryNamespace("u1")).toEqual(["u1", "memories"]);
  expect(memoryNamespace("u1")).not.toEqual(memoryNamespace("u2"));
});

test("remember: เก็บ { text } ใต้ namespace ของผู้ใช้ และคืน key ที่ใช้ดึงกลับได้", async () => {
  const store = makeStore();
  const key = await remember(store, "u1", "ลืมรหัสผ่านต้องเปิด vpn");
  const item = await store.get(memoryNamespace("u1"), key);
  expect(item?.value).toEqual({ text: "ลืมรหัสผ่านต้องเปิด vpn" });
  expect(await remember(store, "u1", "ก")).not.toBe(key);
});

test("recall: ได้ข้อความที่เกี่ยวที่สุดก่อน", async () => {
  const store = makeStore();
  await remember(store, "u1", "คืนเงินได้ใน 7 วัน");
  await remember(store, "u1", "ลืมรหัสผ่านให้รีเซ็ตที่พอร์ทัล");
  expect(await recall(store, "u1", "รหัสผ่าน", 2, 0.3)).toEqual(["ลืมรหัสผ่านให้รีเซ็ตที่พอร์ทัล"]);
});

test("recall: ตัดอันที่คะแนนต่ำกว่าเกณฑ์ ไม่ดึงของที่ไม่เกี่ยวมา", async () => {
  const store = makeStore();
  await remember(store, "u1", "คืนเงินได้ใน 7 วัน");
  expect(await recall(store, "u1", "วันนี้อากาศเป็นไง")).toEqual([]);
});

test("recall: จำกัดจำนวนด้วย k", async () => {
  const store = makeStore();
  for (const t of ["รหัสผ่าน ก", "รหัสผ่าน ข", "รหัสผ่าน ค"]) await remember(store, "u1", t);
  expect(await recall(store, "u1", "รหัสผ่าน", 2, 0.1)).toHaveLength(2);
});

test("ความเป็นส่วนตัว: ความจำของผู้ใช้หนึ่งไม่โผล่ให้อีกคน", async () => {
  const store = makeStore();
  await remember(store, "alice", "รหัสผ่านลับของ alice");
  expect(await recall(store, "bob", "รหัสผ่าน", 5, 0)).toEqual([]);
});

test("บอท: ความจำที่เกี่ยวถูกใส่ในพรอมต์ ส่วนของคนอื่นไม่ถูกใส่", async () => {
  const store = makeStore();
  await remember(store, "alice", "ลืมรหัสผ่านต้องเปิด vpn");
  await remember(store, "bob", "คืนเงินได้ใน 7 วัน รหัสผ่านของ bob");
  const llm = fakeToolLLM(["ตอบแล้ว"]);
  const r = await buildMemoryBot(llm, store).invoke({ userId: "alice", question: "ลืมรหัสผ่านทำไง" });
  expect(r.answer).toBe("ตอบแล้ว");
  const prompt = llm.calls[0][0].text;
  expect(prompt).toContain("ลืมรหัสผ่านต้องเปิด vpn");
  expect(prompt).not.toContain("bob");
});
