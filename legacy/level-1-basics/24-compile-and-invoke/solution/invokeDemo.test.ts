import { buildInvokeDemo } from "./invokeDemo";

test("input ที่ไม่ครบใช้ค่าเริ่มต้น", async () => {
  const result = await buildInvokeDemo().invoke({});
  expect(result.name).toBe("ไม่ระบุชื่อ");
});

test("invoke สองครั้งไม่ปนกัน", async () => {
  const graph = buildInvokeDemo();
  const a = await graph.invoke({ name: "ก" });
  const b = await graph.invoke({ name: "ข" });
  expect(a.message).toBe("สวัสดี ก");
  expect(b.message).toBe("สวัสดี ข");
});

test("ผลลัพธ์มีทุก key ของ state", async () => {
  const result = await buildInvokeDemo().invoke({ name: "ก" });
  expect(Object.keys(result).sort()).toEqual(["message", "name"]);
});
