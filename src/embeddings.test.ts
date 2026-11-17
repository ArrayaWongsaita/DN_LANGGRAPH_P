import { buildEmbeddings } from "./embeddings";

test("ไม่มี key: บอกวิธีตั้งค่าเป็นภาษาไทย", () => {
  expect(() => buildEmbeddings({ apiKey: "", model: "m", dimensions: 8 })).toThrow("GOOGLE_API_KEY");
});

test("มี key: สร้างตัวทำ embedding ได้โดยไม่เรียกเครือข่าย", () => {
  const e = buildEmbeddings({ apiKey: "0123456789abcdef", model: "gemini-embedding-001", dimensions: 8 });
  expect(typeof e.embedQuery).toBe("function");
  expect(typeof e.embedDocuments).toBe("function");
});
