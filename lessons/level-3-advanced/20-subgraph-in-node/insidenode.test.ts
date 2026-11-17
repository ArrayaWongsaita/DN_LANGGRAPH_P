import { buildParent, counter } from "./insidenode";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("subgraph ใช้เดี่ยว ๆ ได้", async () => {
  expect((await counter.invoke({ text: "a b c" })).wc).toBe(3);
});

test("แม่เรียก subgraph ผ่าน node และแปลง State เข้า-ออกถูก", async () => {
  expect((await buildParent().invoke({ doc: "สวัสดี ชาวโลก" })).count).toBe(2);
});

test("State แม่ไม่มี field ของลูก (text/wc) รั่วเข้ามา", async () => {
  const r = await buildParent().invoke({ doc: "x y z" });
  expect(Object.keys(r).sort()).toEqual(["count", "doc"]);
});
