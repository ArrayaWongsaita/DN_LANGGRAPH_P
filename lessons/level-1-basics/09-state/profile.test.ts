import { buildProfileGraph } from "./profile";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("field ที่ไม่ได้ส่งมาจะได้ค่าเริ่มต้น (age = 0, city = ว่าง)", async () => {
  const result = await buildProfileGraph().invoke({ name: "มาลี" });
  expect(result).toEqual({ name: "มาลี", age: 0, city: "" });
});

test("field ที่ส่งมาจะถูกใช้แทนค่าเริ่มต้น", async () => {
  const result = await buildProfileGraph().invoke({ name: "สมชาย", age: 30, city: "เชียงใหม่" });
  expect(result).toEqual({ name: "สมชาย", age: 30, city: "เชียงใหม่" });
});

test("ส่งชนิดข้อมูลผิด (age เป็นข้อความ) ต้อง error", async () => {
  await expect(buildProfileGraph().invoke({ name: "มาลี", age: "สามสิบ" } as never)).rejects.toThrow();
});
