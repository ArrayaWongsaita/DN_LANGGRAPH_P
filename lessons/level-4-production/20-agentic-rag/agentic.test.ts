import { fakeToolLLM } from "@src/fakeToolLLM";
import { InMemoryIndex, KeywordEmbeddings, SAMPLE_DOCS } from "@src/rag";
import { buildAgenticRag } from "./agentic";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) สคริปต์โมเดลเรียงตามลำดับการเรียกจริง
const verdict = (relevant: boolean) => JSON.stringify({ relevant });

async function makeIndex() {
  const index = new InMemoryIndex(new KeywordEmbeddings());
  await index.add(SAMPLE_DOCS);
  return index;
}

test("ผลค้นเกี่ยวข้องตั้งแต่ครั้งแรก: ให้คะแนน → ตอบ (ไม่เขียนคำค้นใหม่)", async () => {
  const llm = fakeToolLLM([verdict(true), "ไปรีเซ็ตที่พอร์ทัล"]);
  const r = await buildAgenticRag(llm, await makeIndex()).invoke({ question: "ลืมรหัสผ่านทำไง" });
  expect(r.answer).toBe("ไปรีเซ็ตที่พอร์ทัล");
  expect(r.rewrites).toBe(0);
  expect(llm.calls).toHaveLength(2);
});

test("ขั้นตอบเห็นเอกสารที่ค้นได้ (พร้อมที่มา)", async () => {
  const llm = fakeToolLLM([verdict(true), "ตอบ"]);
  await buildAgenticRag(llm, await makeIndex()).invoke({ question: "ลืมรหัสผ่านทำไง" });
  const generatePrompt = llm.calls[1][0].text;
  expect(generatePrompt).toContain("[it.md]");
  expect(generatePrompt).toContain("ลืมรหัสผ่านทำไง");
});

test("ไม่เกี่ยวครั้งแรก: เขียนคำค้นใหม่ ค้นอีกรอบ แล้วตอบ", async () => {
  const llm = fakeToolLLM([verdict(false), "รีเซ็ตรหัสผ่าน", verdict(true), "ตอบแล้ว"]);
  const r = await buildAgenticRag(llm, await makeIndex()).invoke({ question: "ทำไงดี" });
  expect(r.rewrites).toBe(1);
  expect(r.query).toBe("รีเซ็ตรหัสผ่าน");
  expect(r.docs).toContain("[it.md]");
  expect(r.answer).toBe("ตอบแล้ว");
});

test("ลองใหม่แล้วยังไม่เกี่ยว: ยอมรับว่าไม่พบ และไม่เรียกโมเดลตอบเลย", async () => {
  const llm = fakeToolLLM([verdict(false), "คำค้นใหม่", verdict(false)]);
  const r = await buildAgenticRag(llm, await makeIndex()).invoke({ question: "ทำไงดี" });
  expect(r.answer).toBe("ไม่พบข้อมูลในเอกสาร");
  expect(llm.calls).toHaveLength(3);
});
