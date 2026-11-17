import { type Counters, buildRetryGraph } from "./retry";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ตั้งเวลาเผื่อไว้เพราะมีการรอระหว่างลองใหม่
vi.setConfig({ testTimeout: 30000 });

test("error ชั่วคราว: ลองใหม่จนสำเร็จ (3 ครั้ง)", async () => {
  const counters: Counters = { flaky: 0, strict: 0 };
  const r = await buildRetryGraph(counters, "flaky").invoke({});
  expect(r.out).toBe("สำเร็จ");
  expect(counters.flaky).toBe(3);
});

test("error ถาวร: ไม่ลองซ้ำ (เรียกครั้งเดียว) และโยน error ออกมา", async () => {
  const counters: Counters = { flaky: 0, strict: 0 };
  await expect(buildRetryGraph(counters, "strict").invoke({})).rejects.toThrow("ผิดถาวร");
  expect(counters.strict).toBe(1);
});
