import { buildCachedGraph } from "./cache";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("input เดิม: node รันจริงครั้งเดียว แต่ผลเหมือนเดิมทุกครั้ง", async () => {
  const counter = { runs: 0 };
  const g = buildCachedGraph(counter);
  expect((await g.invoke({ q: "x" })).out).toBe("x!");
  expect((await g.invoke({ q: "x" })).out).toBe("x!");
  expect(counter.runs).toBe(1);
});

test("input ใหม่: รันใหม่", async () => {
  const counter = { runs: 0 };
  const g = buildCachedGraph(counter);
  await g.invoke({ q: "x" });
  await g.invoke({ q: "y" });
  expect(counter.runs).toBe(2);
});
