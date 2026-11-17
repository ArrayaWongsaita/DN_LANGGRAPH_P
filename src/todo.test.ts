import { todo } from "./todo";

test("todo(n) throw ข้อความไทยที่บอกเลขข้อ", () => {
  expect(() => todo(2)).toThrow("ยังไม่ได้ทำข้อ 2");
});
