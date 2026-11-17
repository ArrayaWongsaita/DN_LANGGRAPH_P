import { userSchema } from "./userSchema";

// ================================================
// บทที่ 05: zod เบื้องต้น
// ฝึก: parse, safeParse
//
// parse: ถูก -> คืนข้อมูล, ผิด -> throw
// safeParse: ไม่ throw คืน { success: true/false, ... }
//
// ตัวอย่าง:
//   expect(userSchema.safeParse({ name: "ก", age: 1 }).success).toBe(true);
// ================================================

// ------------------------------------------------
// ข้อ 1: parse ข้อมูลถูกต้อง { name: "มาลี", age: 20 } ได้ข้อมูลเดิมกลับมา
// แนวทาง: expect(userSchema.parse(...)).toEqual(...)
// ------------------------------------------------
test.todo("parse ข้อมูลที่ถูกต้องได้ค่ากลับมา");
// 👉 เขียน test ของข้อ 1 ตรงนี้

// ------------------------------------------------
// ข้อ 2: age เป็นข้อความ "ยี่สิบ" ต้อง safeParse ได้ success เป็น false
// แนวทาง: expect(userSchema.safeParse(...).success).toBe(false)
// ------------------------------------------------
test.todo("safeParse ข้อมูลผิดได้ success เป็น false");
// 👉 เขียน test ของข้อ 2 ตรงนี้

// ------------------------------------------------
// ข้อ 3: age ติดลบ (-1) error ต้องชี้ไปที่ field "age"
// แนวทาง: ถ้า !result.success ดู result.error.issues[0].path ต้องเท่ากับ ["age"]
// ------------------------------------------------
test.todo("age ติดลบ: error ชี้ไปที่ field age");
// 👉 เขียน test ของข้อ 3 ตรงนี้
