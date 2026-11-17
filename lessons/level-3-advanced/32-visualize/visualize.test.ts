import { buildSample, nodeNames, toMermaid } from "./visualize";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("Mermaid เป็นแผนภาพ graph และมีทุก node", async () => {
  const text = await toMermaid(buildSample());
  expect(text).toContain("graph TD");
  expect(text).toContain("inc");
  expect(text).toContain("done");
});

test("Mermaid แสดงเส้นแบบมีเงื่อนไขและลูปกลับ (inc → inc)", async () => {
  const text = await toMermaid(buildSample());
  expect(text).toMatch(/inc -\.-> inc/);
  expect(text).toMatch(/inc -\.-> done/);
});

test("nodeNames คืนเฉพาะ node ที่ประกาศเอง", async () => {
  expect((await nodeNames(buildSample())).sort()).toEqual(["done", "inc"]);
});
