import { buildDeferGraph } from "./defer";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("final รันเป็นลำดับสุดท้าย หลังสายยาว (b3) เสร็จ", async () => {
  const { log } = await buildDeferGraph().invoke({});
  expect(log[log.length - 1]).toBe("final");
});

test("ทุกสายรันครบ และ final รันครั้งเดียว", async () => {
  const { log } = await buildDeferGraph().invoke({});
  expect([...log].sort()).toEqual(["a", "b1", "b2", "b3", "final"]);
});
