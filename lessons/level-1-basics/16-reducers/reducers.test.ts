import { buildParallelGraph, buildSequentialGraph } from "./reducers";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("log: ค่าใหม่ถูก 'ต่อท้าย' ไม่ใช่ทับ (ทำงานเรียงกัน)", async () => {
  const result = await buildSequentialGraph().invoke({});
  expect(result.log).toEqual(["a", "b"]);
});

test("สอง node ทำงานขนานกันแล้วเขียน log พร้อมกัน ค่าถูกรวมครบทั้งสอง", async () => {
  const result = await buildParallelGraph().invoke({});
  expect([...result.log].sort()).toEqual(["x", "y"]);
});

test("score: ค่าใหม่ถูก 'บวกเพิ่ม' (1 + 2 = 3)", async () => {
  const result = await buildParallelGraph().invoke({});
  expect(result.score).toBe(3);
});

test("ค่าเริ่มต้นที่ส่งเข้ามาก็ผ่าน reducer (score เริ่ม 10 + 1 + 2 = 13)", async () => {
  const result = await buildParallelGraph().invoke({ score: 10 });
  expect(result.score).toBe(13);
});
