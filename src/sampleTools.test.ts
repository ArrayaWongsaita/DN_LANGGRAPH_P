import { makeAddTool, makeWeatherTool } from "./sampleTools";

test("add บวกเลข", async () => {
  expect(await makeAddTool().invoke({ a: 2, b: 3 })).toBe("5");
});

test("getWeather รู้จักเมืองในตาราง และบอกเมื่อไม่รู้จัก", async () => {
  const t = makeWeatherTool();
  expect(await t.invoke({ city: "เชียงใหม่" })).toBe("อากาศเย็น 22 องศา");
  expect(await t.invoke({ city: "ภูเก็ต" })).toBe("ไม่มีข้อมูลของ ภูเก็ต");
});
