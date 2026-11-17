import { readKey } from "./readKey";

test("คืนค่า key เมื่อมีการตั้งค่า", () => {
  expect(readKey({ OLLAMA_API_KEY: "abc123" })).toBe("abc123");
});

test("ถ้าไม่มี key ต้อง throw ข้อความที่พูดถึง OLLAMA_API_KEY", () => {
  expect(() => readKey({})).toThrow(/OLLAMA_API_KEY/);
});

test("ตัดช่องว่างหัวท้ายของ key", () => {
  expect(readKey({ OLLAMA_API_KEY: "  abc123  \n" })).toBe("abc123");
});
