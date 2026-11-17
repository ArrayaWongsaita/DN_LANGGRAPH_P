import { buildRouteGraph, routeByLength } from "./route";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("คำถามสั้นไปทาง short", async () => {
  const result = await buildRouteGraph().invoke({ question: "สั้น" });
  expect(result.path).toBe("short");
});

test("คำถามยาว (21 ตัวอักษร) ไปทาง long", async () => {
  const result = await buildRouteGraph().invoke({ question: "ก".repeat(21) });
  expect(result.path).toBe("long");
});

test("คำถามยาว 20 ตัวอักษรพอดี ยังนับเป็น short (ขอบเขต)", async () => {
  const result = await buildRouteGraph().invoke({ question: "ก".repeat(20) });
  expect(result.path).toBe("short");
});

test("routeByLength ตัดสินจากความยาวของ question", () => {
  expect(routeByLength({ question: "ก".repeat(21) })).toBe("long");
  expect(routeByLength({ question: "ก" })).toBe("short");
});
