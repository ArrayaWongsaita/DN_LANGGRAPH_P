import { type Attempts, buildApp } from "./defaults";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
vi.setConfig({ testTimeout: 30000 }); // retry มีเวลารอจริง

const fresh = (): Attempts => ({ a: 0, b: 0, strict: 0 });

test("a และ b ล้มสองครั้งแต่ได้ค่าเริ่มต้น (ลองสูงสุด 3): ถูกลองครบจนสำเร็จ", async () => {
  const attempts = fresh();
  await expect(buildApp(attempts).invoke({})).rejects.toThrow("strict ล้ม");
  expect(attempts.a).toBe(3);
  expect(attempts.b).toBe(3);
});

test("strict ตั้งทับเป็นลองครั้งเดียว: ล้มครั้งแรกแล้วจบ ไม่ลองใหม่", async () => {
  const attempts = fresh();
  await expect(buildApp(attempts).invoke({})).rejects.toThrow("strict ล้ม");
  expect(attempts.strict).toBe(1);
});
