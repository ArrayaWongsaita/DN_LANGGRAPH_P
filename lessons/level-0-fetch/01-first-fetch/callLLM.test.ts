import { fakeFetch } from "@src/fakeFetch";
import { callLLM } from "./callLLM";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ใช้ fetch ปลอมที่ตอบตามที่เขียนไว้ จึงไม่ต้องมี key และไม่ยิงเครือข่าย
// ตัวอย่าง response รูปแบบจริงที่ LLM ส่งกลับมา (ย่อให้เหลือเท่าที่ใช้)
const sampleResponse = (text: string) => ({
  id: "chatcmpl-1",
  object: "chat.completion",
  choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: "stop" }],
});

const args = (fetchFn: typeof fetch) => ({
  fetchFn,
  url: "https://llm.test/v1/chat/completions",
  apiKey: "test-key",
  model: "my-model",
  question: "ทักทายหน่อย",
});

test("คืนข้อความจาก choices[0].message.content", async () => {
  const f = fakeFetch([{ body: sampleResponse("สวัสดี") }]);
  expect(await callLLM(args(f))).toBe("สวัสดี");
});

test("เรียก URL ที่ส่งเข้ามา ด้วยวิธี POST เพียงครั้งเดียว", async () => {
  const f = fakeFetch([{ body: sampleResponse("x") }]);
  await callLLM(args(f));
  expect(f.calls).toHaveLength(1);
  expect(f.calls[0].url).toBe("https://llm.test/v1/chat/completions");
  expect(f.calls[0].init?.method).toBe("POST");
});

test("header ต้องมี Authorization แบบ Bearer และ Content-Type เป็น JSON", async () => {
  const f = fakeFetch([{ body: sampleResponse("x") }]);
  await callLLM(args(f));
  const headers = new Headers(f.calls[0].init?.headers);
  expect(headers.get("authorization")).toBe("Bearer test-key");
  expect(headers.get("content-type")).toBe("application/json");
});

test("body เป็น JSON ที่มี model และ messages ที่มีคำถามของผู้ใช้", async () => {
  const f = fakeFetch([{ body: sampleResponse("x") }]);
  await callLLM(args(f));
  const body = JSON.parse(String(f.calls[0].init?.body));
  expect(body.model).toBe("my-model");
  expect(body.messages).toEqual([{ role: "user", content: "ทักทายหน่อย" }]);
});
