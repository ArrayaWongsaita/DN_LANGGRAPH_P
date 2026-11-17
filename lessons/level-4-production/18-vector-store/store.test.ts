import { KeywordEmbeddings, SAMPLE_DOCS } from "@src/rag";
import { SimpleIndex } from "./store";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ค้นหา: ชิ้นที่ตรงที่สุดมาก่อน พร้อมที่มาและคะแนน", async () => {
  const index = new SimpleIndex(new KeywordEmbeddings());
  await index.add(SAMPLE_DOCS);
  const hits = await index.search("คืนเงินได้ไหม", 3);
  expect(hits[0].source).toBe("shop.md");
  expect(hits[0].score).toBeGreaterThan(hits[1].score);
  expect(hits[0].text).toContain("คืนเงิน");
});

test("จำกัดจำนวนด้วย k และ store ว่างคืนอาร์เรย์ว่าง", async () => {
  const index = new SimpleIndex(new KeywordEmbeddings());
  expect(await index.search("อะไรก็ได้", 3)).toEqual([]);
  await index.add(SAMPLE_DOCS);
  expect(await index.search("ลา", 2)).toHaveLength(2);
});

test("add หลายครั้งสะสมต่อกัน ไม่ทับของเดิม", async () => {
  const index = new SimpleIndex(new KeywordEmbeddings());
  await index.add([SAMPLE_DOCS[0]]);
  await index.add([SAMPLE_DOCS[1], SAMPLE_DOCS[2]]);
  expect(await index.search("รหัสผ่าน", 10)).toHaveLength(3);
});

test("embed เอกสารตอน add ครั้งเดียว (ไม่ embed เอกสารซ้ำทุกครั้งที่ค้นหา)", async () => {
  const embeddings = new KeywordEmbeddings();
  let docCalls = 0;
  const original = embeddings.embedDocuments.bind(embeddings);
  embeddings.embedDocuments = async (texts: string[]) => {
    docCalls++;
    return original(texts);
  };
  const index = new SimpleIndex(embeddings);
  await index.add(SAMPLE_DOCS);
  await index.search("ลา", 1);
  await index.search("vpn", 1);
  expect(docCalls).toBe(1);
});
