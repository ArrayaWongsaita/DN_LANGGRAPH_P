import { fakeFetch } from "./fakeFetch";

test("เรียกครั้งแรกได้ reply แรก เป็น Response จริง (ok, json)", async () => {
  const f = fakeFetch([{ body: { hello: "โลก" } }]);
  const res = await f("https://x.test/a");
  expect(res.ok).toBe(true);
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ hello: "โลก" });
});

test("status 401 ได้ ok=false", async () => {
  const f = fakeFetch([{ status: 401, body: { error: "bad key" } }]);
  const res = await f("https://x.test/a");
  expect(res.ok).toBe(false);
  expect(res.status).toBe(401);
});

test("calls บันทึก url และ init ของแต่ละครั้ง", async () => {
  const f = fakeFetch([{ body: {} }, { body: {} }]);
  await f("https://x.test/one", { method: "POST", body: JSON.stringify({ a: 1 }) });
  await f("https://x.test/two");
  expect(f.calls.map((c) => c.url)).toEqual(["https://x.test/one", "https://x.test/two"]);
  expect(JSON.parse(String(f.calls[0].init?.body))).toEqual({ a: 1 });
  expect(f.calls[0].init?.method).toBe("POST");
});

test("body เป็น string ส่งเป็นข้อความดิบ (text)", async () => {
  const f = fakeFetch([{ body: "data: hi\n\n" }]);
  expect(await (await f("https://x.test")).text()).toBe("data: hi\n\n");
});

test("headers ที่กำหนดถูกส่งกลับมาใน Response", async () => {
  const f = fakeFetch([{ status: 429, body: {}, headers: { "retry-after": "7" } }]);
  expect((await f("https://x.test")).headers.get("retry-after")).toBe("7");
});

test("เรียกเกินจำนวน reply ที่เขียนไว้ ต้อง reject พร้อมข้อความชัดเจน (ไม่วนซ้ำ)", async () => {
  const f = fakeFetch([{ body: {} }]);
  await f("https://x.test");
  await expect(f("https://x.test")).rejects.toThrow("fakeFetch: ไม่มี reply เหลือแล้ว (เรียกครั้งที่ 2)");
});

test("รับ URL ที่เป็น URL object ได้ และบันทึกเป็น string", async () => {
  const f = fakeFetch([{ body: {} }]);
  await f(new URL("https://x.test/p"));
  expect(f.calls[0].url).toBe("https://x.test/p");
});
