import { explainError } from "./explainError";

test("401 อธิบายว่า key ผิด", () => {
  expect(explainError({ status: 401 })).toMatch(/OLLAMA_API_KEY/);
});

test("404 อธิบายเรื่อง baseUrl ห้ามมี /api", () => {
  const text = explainError({ status: 404 });
  expect(text).toMatch(/baseUrl|OLLAMA_BASE_URL/);
  expect(text).toMatch(/\/api/);
});

test("429 อธิบายว่าเรียกถี่เกินไป", () => {
  expect(explainError({ status: 429 })).toMatch(/ถี่|โควตา|รอ/);
});

test("ENOTFOUND และ ECONNREFUSED อธิบายเรื่องเครือข่าย", () => {
  expect(explainError({ code: "ENOTFOUND" })).toMatch(/เครือข่าย|อินเทอร์เน็ต/);
  expect(explainError({ code: "ECONNREFUSED" })).toMatch(/เครือข่าย|อินเทอร์เน็ต/);
});

test("error อื่นคืนข้อความเดิม", () => {
  expect(explainError(new Error("boom"))).toContain("boom");
});

// error จริงจาก provider หน้าตาไม่เหมือน object ที่แต่งเอง
test("ollama ResponseError ใช้ status_code", () => {
  expect(explainError({ name: "ResponseError", message: "unauthorized", status_code: 401 })).toMatch(/OLLAMA_API_KEY/);
});

test("TypeError('fetch failed') ที่มี cause.code เป็นเรื่องเครือข่าย", () => {
  const e = new TypeError("fetch failed", { cause: { code: "ENOTFOUND" } });
  expect(explainError(e)).toMatch(/เครือข่าย|อินเทอร์เน็ต/);
});
