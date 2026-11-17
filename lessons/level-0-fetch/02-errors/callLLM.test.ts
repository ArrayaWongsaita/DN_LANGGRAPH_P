import { fakeFetch } from "@src/fakeFetch";
import { callLLM, explainStatus } from "./callLLM";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const errorBody = (message: string) => ({ error: { message, type: "invalid_request_error", code: "x" } });
const ok = { choices: [{ message: { role: "assistant", content: "สวัสดี" } }] };

const args = (fetchFn: typeof fetch) => ({
  fetchFn,
  url: "https://llm.test/v1/chat/completions",
  apiKey: "k",
  model: "m",
  question: "q",
});

test("explainStatus 401: บอกให้ตรวจ key ใน .env", () => {
  expect(explainStatus(401, "Invalid API Key")).toMatch(/key/i);
  expect(explainStatus(401, "Invalid API Key")).toContain(".env");
});

test("explainStatus 404: บอกว่าไม่พบโมเดล และมีข้อความจากเซิร์ฟเวอร์", () => {
  const text = explainStatus(404, "model `abc` does not exist");
  expect(text).toContain("โมเดล");
  expect(text).toContain("model `abc` does not exist");
});

test("explainStatus 429: บอกให้รอ และถ้ารู้ retry-after ให้บอกจำนวนวินาที", () => {
  expect(explainStatus(429, "")).toContain("รอ");
  expect(explainStatus(429, "", "7")).toContain("7");
});

test("explainStatus สถานะอื่น: แสดงเลขสถานะและข้อความจากเซิร์ฟเวอร์", () => {
  const text = explainStatus(500, "boom");
  expect(text).toContain("500");
  expect(text).toContain("boom");
});

test("เรียกสำเร็จ: ยังคืนข้อความคำตอบเหมือนเดิม", async () => {
  expect(await callLLM(args(fakeFetch([{ body: ok }])))).toBe("สวัสดี");
});

test("key ผิด (401): throw Error ข้อความไทยที่อธิบายสาเหตุ", async () => {
  const f = fakeFetch([{ status: 401, body: errorBody("Invalid API Key") }]);
  await expect(callLLM(args(f))).rejects.toThrow(/key/i);
});

test("โมเดลไม่มี (404): ข้อความมีรายละเอียดจากเซิร์ฟเวอร์", async () => {
  const f = fakeFetch([{ status: 404, body: errorBody("model `zzz` not found") }]);
  await expect(callLLM(args(f))).rejects.toThrow("model `zzz` not found");
});

test("เรียกถี่เกิน (429): ใช้ header retry-after บอกเวลารอ", async () => {
  const f = fakeFetch([{ status: 429, body: errorBody("rate limit"), headers: { "retry-after": "12" } }]);
  await expect(callLLM(args(f))).rejects.toThrow("12");
});

test("body ของ error ไม่ใช่ JSON ก็ต้องไม่พังซ้อน: ยังได้ข้อความตามสถานะ", async () => {
  const f = fakeFetch([{ status: 500, body: "<html>oops</html>" }]);
  await expect(callLLM(args(f))).rejects.toThrow("500");
});

test("เครือข่ายล่ม (fetch throw): ได้ข้อความไทยที่บอกว่าเชื่อมต่อไม่ได้", async () => {
  const failing = (() => Promise.reject(new TypeError("fetch failed"))) as unknown as typeof fetch;
  await expect(callLLM(args(failing))).rejects.toThrow("เชื่อมต่อ");
});
