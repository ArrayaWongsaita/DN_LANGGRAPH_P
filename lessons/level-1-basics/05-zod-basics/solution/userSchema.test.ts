import { userSchema } from "./userSchema";

test("parse ข้อมูลที่ถูกต้องได้ค่ากลับมา", () => {
  expect(userSchema.parse({ name: "มาลี", age: 20 })).toEqual({ name: "มาลี", age: 20 });
});

test("safeParse ข้อมูลผิดได้ success เป็น false", () => {
  expect(userSchema.safeParse({ name: "มาลี", age: "ยี่สิบ" }).success).toBe(false);
});

test("age ติดลบ: error ชี้ไปที่ field age", () => {
  const result = userSchema.safeParse({ name: "มาลี", age: -1 });
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error.issues[0].path).toEqual(["age"]);
});
