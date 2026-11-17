import { makeAddTool, makeWeatherTool } from "./tools";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("add: มีชื่อและคำอธิบาย", () => {
  const t = makeAddTool();
  expect(t.name).toBe("add");
  expect(t.description.length).toBeGreaterThan(0);
});

test("add: บวกเลขได้ ผลเป็นสตริง", async () => {
  expect(await makeAddTool().invoke({ a: 2, b: 3 })).toBe("5");
});

test("add: argument ผิดชนิดถูก schema ปฏิเสธ", async () => {
  await expect(makeAddTool().invoke({ a: "สอง", b: 3 } as never)).rejects.toThrow();
});

test("getWeather: เมืองที่มีในตาราง", async () => {
  expect(await makeWeatherTool().invoke({ city: "เชียงใหม่" })).toBe("อากาศเย็น 22 องศา");
});

test("getWeather: เมืองที่ไม่มีในตาราง", async () => {
  expect(await makeWeatherTool().invoke({ city: "ภูเก็ต" })).toBe("ไม่มีข้อมูลของ ภูเก็ต");
});
