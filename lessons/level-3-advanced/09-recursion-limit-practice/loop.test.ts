import { limitForRounds, runLoop } from "./loop";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("วนครบ target แล้วหยุดเอง", async () => {
  expect(await runLoop(5)).toEqual({ ok: true, n: 5 });
});

test("เพดานพอดีกับจำนวนรอบที่ตั้งใจ (วนได้ 50 รอบโดยไม่ชน)", async () => {
  expect(await runLoop(50)).toEqual({ ok: true, n: 50 });
  expect(limitForRounds(50)).toBeGreaterThanOrEqual(51);
});

test("เพดานต่ำกว่างาน: ได้ ok:false ไม่ใช่ exception", async () => {
  expect(await runLoop(30, 10)).toEqual({ ok: false, reason: "วนเกินเพดาน" });
});
