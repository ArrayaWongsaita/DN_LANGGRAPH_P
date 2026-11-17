import { errorCode, errorStatus } from "./errorInfo";

describe("errorStatus", () => {
  test("อ่าน status จากรูปแบบที่ ollama ใช้จริง (status_code)", () => {
    expect(errorStatus({ name: "ResponseError", message: "unauthorized", status_code: 401 })).toBe(401);
  });
  test("อ่าน status จาก response.status และ status ตรง ๆ", () => {
    expect(errorStatus({ response: { status: 429 } })).toBe(429);
    expect(errorStatus({ status: 404 })).toBe(404);
  });
  test("ไม่มี status หรือไม่ใช่ object ได้ undefined", () => {
    expect(errorStatus(new Error("x"))).toBeUndefined();
    expect(errorStatus(undefined)).toBeUndefined();
    expect(errorStatus(null)).toBeUndefined();
  });
});

describe("errorCode", () => {
  test("อ่าน code จาก cause ของ TypeError('fetch failed')", () => {
    const e = new TypeError("fetch failed", { cause: { code: "ENOTFOUND" } });
    expect(errorCode(e)).toBe("ENOTFOUND");
  });
  test("อ่าน code ตรง ๆ ได้", () => {
    expect(errorCode({ code: "ECONNREFUSED" })).toBe("ECONNREFUSED");
  });
});

describe("รูปแบบ error จริงของ Groq (บันทึกจาก spike)", () => {
  test("AuthenticationError / NotFoundError ของ SDK มี status ตรง ๆ", () => {
    const groq401 = { status: 401, headers: {}, error: { error: { code: "invalid_api_key" } } };
    expect(errorStatus(groq401)).toBe(401);
    expect(errorStatus({ status: 404, headers: {} })).toBe(404);
  });
});
