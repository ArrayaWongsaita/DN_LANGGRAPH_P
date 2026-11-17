import { buildStreamDemo, collectUpdates } from "./streamDemo";

test("update เรียงตามลำดับ node", async () => {
  const updates = await collectUpdates(buildStreamDemo(), {});
  expect(updates.map((u) => u.node)).toEqual(["first", "second"]);
});

test("จำนวน update เท่ากับจำนวน node", async () => {
  const updates = await collectUpdates(buildStreamDemo(), {});
  expect(updates).toHaveLength(2);
});

test("values ตัวสุดท้ายเท่ากับผลของ invoke", async () => {
  const graph = buildStreamDemo();
  const values: unknown[] = [];
  for await (const v of await graph.stream({}, { streamMode: "values" })) values.push(v);
  expect(values[values.length - 1]).toEqual(await graph.invoke({}));
});
