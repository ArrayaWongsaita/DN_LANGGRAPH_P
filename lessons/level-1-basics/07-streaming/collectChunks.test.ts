import { fakeLLM } from "@src/fakeLLM";
import { collectChunks } from "./collectChunks";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)  LLM ปลอมจะทยอยส่งทีละตัวอักษรเพื่อจำลอง streaming
test("ได้ข้อความหลายชิ้น (ไม่ใช่ก้อนเดียว)", async () => {
  const chunks = await collectChunks(fakeLLM(["สวัสดี"]), "ทักหน่อย");
  expect(chunks.length).toBeGreaterThan(1);
});

test("ต่อทุกชิ้นกลับแล้วต้องได้คำตอบเต็ม", async () => {
  const chunks = await collectChunks(fakeLLM(["สวัสดีครับ"]), "ทักหน่อย");
  expect(chunks.join("")).toBe("สวัสดีครับ");
});

test("แต่ละชิ้นเป็น string", async () => {
  const chunks = await collectChunks(fakeLLM(["abc"]), "q");
  expect(chunks.every((c) => typeof c === "string")).toBe(true);
});
