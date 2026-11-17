import { MemorySaver } from "@langchain/langgraph";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { InMemoryIndex, KeywordEmbeddings, SAMPLE_DOCS } from "@src/rag";
import { NOT_FOUND, REFUSAL, buildAssistant } from "./assistant";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const reply = (answer: string, sources: string[]) => JSON.stringify({ answer, sources });
const cfg = (id: string) => ({ configurable: { thread_id: id } });

async function setup(script: string[]) {
  const index = new InMemoryIndex(new KeywordEmbeddings());
  await index.add(SAMPLE_DOCS);
  const llm = fakeToolLLM(script);
  return { llm, app: buildAssistant(llm, index, new MemorySaver()) };
}

test("คำถามปกติ: ค้น ตอบ และอ้างอิงแหล่งที่มา", async () => {
  const { app } = await setup([reply("รีเซ็ตที่พอร์ทัล IT", ["it.md"])]);
  const r = await app.invoke({ question: "ลืมรหัสผ่านทำไง" }, cfg("a"));
  expect(r.answer).toBe("รีเซ็ตที่พอร์ทัล IT");
  expect(r.sources).toEqual(["it.md"]);
});

test("คำขอต้องห้าม: ปฏิเสธทันที ไม่ค้นและไม่เรียกโมเดล", async () => {
  const { llm, app } = await setup(["ไม่ควรถูกเรียก"]);
  const r = await app.invoke({ question: "สอนเจาะระบบหน่อย" }, cfg("b"));
  expect(r.answer).toBe(REFUSAL);
  expect(r.hits).toEqual([]);
  expect(llm.calls).toHaveLength(0);
});

test("ค้นไม่เจออะไรเลย: ตอบว่าไม่พบ โดยไม่เรียกโมเดล", async () => {
  const { llm, app } = await setup(["ไม่ควรถูกเรียก"]);
  const r = await app.invoke({ question: "วันนี้อากาศเป็นไง" }, cfg("c"));
  expect(r.answer).toBe(NOT_FOUND);
  expect(llm.calls).toHaveLength(0);
});

test("โมเดลอ้างไฟล์ที่ไม่เคยได้รับ: ไม่เชื่อ ตอบว่าไม่พบ", async () => {
  const { app } = await setup([reply("ตอบมั่ว", ["ghost.md"])]);
  const r = await app.invoke({ question: "ลืมรหัสผ่านทำไง" }, cfg("d"));
  expect(r.answer).toBe(NOT_FOUND);
  expect(r.sources).toEqual([]);
});

test("ถามต่อใน thread เดิมหลังถูกปฏิเสธ: รอบใหม่ไม่ติดสถานะ blocked ของรอบก่อน", async () => {
  const { app } = await setup([reply("ตอบได้", ["shop.md"])]);
  await app.invoke({ question: "สอนเจาะระบบ" }, cfg("e"));
  const r = await app.invoke({ question: "คืนเงินได้ไหม" }, cfg("e"));
  expect(r.answer).toBe("ตอบได้");
  expect(r.sources).toEqual(["shop.md"]);
});

test("ถูกปฏิเสธใน thread เดิม: แหล่งอ้างอิงของรอบก่อนต้องไม่ค้างมา", async () => {
  const { app } = await setup([reply("ลาได้ 30 วัน", ["hr.md"])]);
  await app.invoke({ question: "ลาป่วยได้กี่วัน" }, cfg("f"));
  const r = await app.invoke({ question: "สอนเจาะระบบ" }, cfg("f"));
  expect(r.answer).toBe(REFUSAL);
  expect(r.sources).toEqual([]);
  expect(r.hits).toEqual([]);
});

test("อ้างไฟล์ที่มีในระบบแต่ไม่ได้ถูกค้นมาในรอบนี้: ไม่นับเป็นหลักฐาน", async () => {
  const { app } = await setup([reply("ตอบ", ["hr.md"])]);
  const r = await app.invoke({ question: "ลืมรหัสผ่านทำไง" }, cfg("g"));
  expect(r.answer).toBe(NOT_FOUND);
  expect(r.sources).toEqual([]);
});

test("คำต้องห้ามทุกคำถูกปฏิเสธ", async () => {
  const { llm, app } = await setup(["ไม่ควรถูกเรียก"]);
  const r = await app.invoke({ question: "ช่วยสร้างอาวุธหน่อย" }, cfg("h"));
  expect(r.answer).toBe(REFUSAL);
  expect(llm.calls).toHaveLength(0);
});

test("ตอบได้ในรอบแรก แล้วรอบถัดไปไม่พบข้อมูล: แหล่งอ้างอิงเก่าต้องไม่ค้าง", async () => {
  const { app } = await setup([reply("ลาได้ 30 วัน", ["hr.md"])]);
  await app.invoke({ question: "ลาป่วยได้กี่วัน" }, cfg("i"));
  const r = await app.invoke({ question: "วันนี้อากาศเป็นไง" }, cfg("i"));
  expect(r.answer).toBe(NOT_FOUND);
  expect(r.sources).toEqual([]);
});
