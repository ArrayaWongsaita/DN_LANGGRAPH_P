import { MemorySaver } from "@langchain/langgraph";
import { buildContextGraph } from "./context";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ส่ง context lang=en ได้ Hello", async () => {
  expect((await buildContextGraph().invoke({}, { context: { lang: "en" } })).out).toBe("Hello");
});

test("ส่ง context lang=th ได้ภาษาไทย", async () => {
  expect((await buildContextGraph().invoke({}, { context: { lang: "th" } })).out).toBe("สวัสดี");
});

test("ไม่ส่ง context: ใช้ค่าสำรอง (ไม่ error)", async () => {
  expect((await buildContextGraph().invoke({})).out).toBe("สวัสดี");
});

test("แต่ละครั้งที่เรียกใช้ context ของตัวเอง (ไม่ค้างข้ามครั้ง)", async () => {
  const g = buildContextGraph();
  expect((await g.invoke({}, { context: { lang: "en" } })).out).toBe("Hello");
  expect((await g.invoke({}, { context: { lang: "th" } })).out).toBe("สวัสดี");
});

test("context ไม่ปนใน State ที่ผลลัพธ์", async () => {
  const r = await buildContextGraph().invoke({}, { context: { lang: "en" } });
  expect(Object.keys(r)).toEqual(["out"]);
});
