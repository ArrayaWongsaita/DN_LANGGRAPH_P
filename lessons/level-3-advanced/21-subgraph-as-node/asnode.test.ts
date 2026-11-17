import { buildPipeline, normalize } from "./asnode";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("subgraph ทำงานเดี่ยวได้", async () => {
  expect((await normalize.invoke({ text: "  HeLLo " })).text).toBe("hello");
});

test("pipeline: normalize ก่อน แล้ว measure วัดความยาวของข้อความที่ทำความสะอาดแล้ว", async () => {
  const r = await buildPipeline().invoke({ text: "  ABC  " });
  expect(r.text).toBe("abc");
  expect(r.length).toBe(3);
});

test("graph แม่เห็น subgraph เป็น node ชื่อ normalize", async () => {
  const g = await buildPipeline().getGraphAsync();
  expect(Object.keys(g.nodes)).toContain("normalize");
});

test("normalize เป็น subgraph จริง (เปิด xray แล้วเห็น node ข้างใน)", async () => {
  const g = await buildPipeline().getGraphAsync({ xray: true });
  expect(Object.keys(g.nodes).some((n) => n.includes("clean"))).toBe(true);
});
