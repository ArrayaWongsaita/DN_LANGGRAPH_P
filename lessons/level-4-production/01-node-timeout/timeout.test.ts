import { buildJob, runJob } from "./timeout";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ทำงานเร็วกว่าเพดาน: สำเร็จ", async () => {
  expect(await runJob(buildJob(10, 1000))).toEqual({ ok: true, log: "เสร็จ" });
});

test("ทำงานช้ากว่าเพดาน: ได้ผลหมดเวลาพร้อมชื่อ node (ไม่ใช่ exception)", async () => {
  expect(await runJob(buildJob(400, 50))).toEqual({ ok: false, node: "slow" });
});

test("หมดเวลาแล้วกลับมาเร็ว ไม่รอจนงานเสร็จ", async () => {
  const start = Date.now();
  await runJob(buildJob(2000, 50));
  expect(Date.now() - start).toBeLessThan(1000);
});
