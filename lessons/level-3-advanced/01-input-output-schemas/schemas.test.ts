import { buildSchemaGraph } from "./schemas";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("คืนเฉพาะ field ใน output schema", async () => {
  const result = await buildSchemaGraph().invoke({ question: "ฟ้าสีอะไร" });
  expect(result).toEqual({ answer: "คำตอบของ: ฟ้าสีอะไร" });
});

test("field ส่วนตัว scratch ไม่รั่วออกไป", async () => {
  const result = await buildSchemaGraph().invoke({ question: "x" });
  expect(result).not.toHaveProperty("scratch");
  expect(result).not.toHaveProperty("question");
});
