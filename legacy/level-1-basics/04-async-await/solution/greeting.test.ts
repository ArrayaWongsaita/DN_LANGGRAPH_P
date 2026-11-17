import { fetchGreeting } from "./greeting";

test("await คืนค่าที่ resolve ออกมา", async () => {
  expect(await fetchGreeting("มาลี")).toBe("สวัสดี มาลี");
});

test("Promise.all รอหลายงานพร้อมกันได้", async () => {
  const result = await Promise.all([fetchGreeting("ก"), fetchGreeting("ข")]);
  expect(result).toEqual(["สวัสดี ก", "สวัสดี ข"]);
});

test("ชื่อว่างต้อง reject แล้วจับด้วย rejects ได้", async () => {
  await expect(fetchGreeting("")).rejects.toThrow("ต้องมีชื่อ");
});
