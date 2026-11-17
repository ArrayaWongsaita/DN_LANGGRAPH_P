import { maskKey, readKey } from "./readKey";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("readKey อ่านค่าตามชื่อตัวแปรที่ระบุ", () => {
  expect(readKey({ GROQ_API_KEY: "gsk_abcdef" }, "GROQ_API_KEY")).toBe("gsk_abcdef");
});

test("readKey ตัดช่องว่างหัวท้าย", () => {
  expect(readKey({ K: "  abc  " }, "K")).toBe("abc");
});

test("readKey คืน undefined เมื่อไม่มีตัวแปร หรือเป็นค่าว่าง/ช่องว่างล้วน", () => {
  expect(readKey({}, "K")).toBeUndefined();
  expect(readKey({ K: "" }, "K")).toBeUndefined();
  expect(readKey({ K: "   " }, "K")).toBeUndefined();
});

test("maskKey โชว์แค่ 4 ตัวแรก แล้วตามด้วย ...", () => {
  expect(maskKey("gsk_abcdef123456")).toBe("gsk_...");
});

test("maskKey ไม่โชว์ key ที่สั้นกว่า 4 ตัวเลย", () => {
  expect(maskKey("ab")).toBe("...");
});
