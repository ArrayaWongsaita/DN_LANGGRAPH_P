import { buildRouteGraph, routeByLength } from "./route";

test("คำถามยาว 20 ตัวอักษรหรือสั้นกว่าเป็น short", () => {
  expect(routeByLength({ question: "a".repeat(20) })).toBe("short");
});

test("คำถามยาว 21 ตัวอักษรขึ้นไปเป็น long", () => {
  expect(routeByLength({ question: "a".repeat(21) })).toBe("long");
});

test("graph ไปเฉพาะสาขาที่เลือก", async () => {
  const graph = buildRouteGraph();
  expect((await graph.invoke({ question: "สั้น" })).path).toBe("short");
  expect((await graph.invoke({ question: "a".repeat(30) })).path).toBe("long");
});
