import { buildWorkflow, runs } from "./functional";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
beforeEach(() => {
  runs.double = 0;
});

test("คำนวณถูก: n=3 → a=6 → 12 + 14 = 26", async () => {
  expect(await buildWorkflow().invoke(3, { configurable: { thread_id: "1" } })).toBe(26);
});

test("task ถูกเรียกสามครั้ง (หนึ่งก่อน สองขนาน)", async () => {
  await buildWorkflow().invoke(1, { configurable: { thread_id: "1" } });
  expect(runs.double).toBe(3);
});

test("ใช้ thread_id ต่างกันได้ ผลไม่ปนกัน", async () => {
  const wf = buildWorkflow();
  expect(await wf.invoke(1, { configurable: { thread_id: "a" } })).toBe(2 * 2 + (2 * 2 + 2 + 0));
  expect(await wf.invoke(0, { configurable: { thread_id: "b" } })).toBe(0 + 2);
});
