import { withRetry } from "./retry";

test("สำเร็จหลังล้มเหลวสองครั้ง", async () => {
  let calls = 0;
  const fn = async () => {
    calls++;
    if (calls < 3) throw new Error("fail");
    return "ok";
  };
  expect(await withRetry(fn, { retries: 3, delayMs: 0 })).toBe("ok");
  expect(calls).toBe(3);
});

test("ลองครบแล้วยังล้มเหลวต้อง throw error ล่าสุด", async () => {
  let calls = 0;
  const fn = async () => {
    calls++;
    throw new Error(`fail ${calls}`);
  };
  await expect(withRetry(fn, { retries: 2, delayMs: 0 })).rejects.toThrow("fail 3");
});

test("error 401 ไม่ retry (เรียกครั้งเดียว)", async () => {
  let calls = 0;
  const fn = async () => {
    calls++;
    throw Object.assign(new Error("unauthorized"), { status: 401 });
  };
  await expect(withRetry(fn, { retries: 3, delayMs: 0 })).rejects.toThrow("unauthorized");
  expect(calls).toBe(1);
});

test("401 ในรูป status_code (ollama) ก็ไม่ retry", async () => {
  let calls = 0;
  const fn = async () => {
    calls++;
    throw Object.assign(new Error("unauthorized"), { status_code: 401 });
  };
  await expect(withRetry(fn, { retries: 3, delayMs: 0 })).rejects.toThrow("unauthorized");
  expect(calls).toBe(1);
});

test("throw ค่า undefined ก็ส่งต่อได้ ไม่ใช่ TypeError ใหม่", async () => {
  await expect(
    withRetry(async () => {
      throw undefined;
    }, { retries: 0, delayMs: 0 }),
  ).rejects.toBeUndefined();
});
