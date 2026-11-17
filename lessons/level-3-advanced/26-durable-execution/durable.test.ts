import { type Runs, buildLongJob, resumeJob, runJob } from "./durable";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const fresh = () => ({ runs: { one: 0, two: 0, three: 0 } as Runs, fail: { value: true } });

test("ขั้นสองล่มครั้งแรก: runJob คืน false", async () => {
  const { runs, fail } = fresh();
  expect(await runJob(buildLongJob(runs, fail), "t")).toBe(false);
});

test("ทำต่อหลังล่ม: ได้ผลครบ 123", async () => {
  const { runs, fail } = fresh();
  const job = buildLongJob(runs, fail);
  await runJob(job, "t");
  expect(await resumeJob(job, "t")).toBe("123");
});

test("ขั้นหนึ่งที่สำเร็จแล้วไม่ถูกทำซ้ำ ส่วนขั้นสองที่ล่มถูกลองใหม่", async () => {
  const { runs, fail } = fresh();
  const job = buildLongJob(runs, fail);
  await runJob(job, "t");
  await resumeJob(job, "t");
  expect(runs).toEqual({ one: 1, two: 2, three: 1 });
});

test("ไม่ล่ม: runJob สำเร็จทีเดียว", async () => {
  const { runs } = fresh();
  expect(await runJob(buildLongJob(runs, { value: false }), "t")).toBe(true);
  expect(runs).toEqual({ one: 1, two: 1, three: 1 });
});
