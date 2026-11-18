import { check } from "./check";

afterEach(() => {
  process.exitCode = undefined;
  vi.restoreAllMocks();
});

test("check ผ่าน: พิมพ์ ✅ และไม่ตั้ง exit code", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  expect(check("ข้อหนึ่ง", true)).toBe(true);
  expect(log).toHaveBeenCalledWith("✅ ข้อหนึ่ง");
  expect(process.exitCode).toBeUndefined();
});

test("check ไม่ผ่าน: พิมพ์ ❌ พร้อมคำใบ้ และตั้ง exit code = 1", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  expect(check("ข้อสอง", false, "ลืม await")).toBe(false);
  expect(log).toHaveBeenCalledWith("❌ ข้อสอง  (ลืม await)");
  expect(process.exitCode).toBe(1);
});
