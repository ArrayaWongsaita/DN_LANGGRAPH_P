import { buildStreamDemo, collectUpdates, collectValues } from "./streamDemo";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("updates: ได้ชิ้นละ 1 node เรียงตามที่ทำงาน พร้อมสิ่งที่ node นั้นอัปเดต", async () => {
  const updates = await collectUpdates(buildStreamDemo(), {});
  expect(updates.map((u) => u.node)).toEqual(["first", "second"]);
  expect(updates[0].update).toEqual({ log: "first" });
});

test("values: ได้ state เต็มหลังแต่ละก้าว รวม state เริ่มต้น (2 node = 3 ชิ้น)", async () => {
  const values = await collectValues(buildStreamDemo(), { log: "start" });
  expect(values).toHaveLength(3);
  expect(values[0]).toEqual({ log: ["start"] });
  expect(values[2]).toEqual({ log: ["start", "first", "second"] });
});
