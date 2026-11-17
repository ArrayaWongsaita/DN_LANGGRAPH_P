import { allSnapshots, buildTimeGraph, cfg, findBefore } from "./history";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("ประวัติเรียงใหม่ไปเก่า: ล่าสุดคือจบแล้ว (next ว่าง) และ log ครบ", async () => {
  const graph = buildTimeGraph();
  await graph.invoke({}, cfg("t"));
  const snaps = await allSnapshots(graph, "t");
  expect(snaps[0].next).toEqual([]);
  expect(snaps[0].values.log).toEqual(["a", "b", "c"]);
  expect(snaps.length).toBeGreaterThanOrEqual(4);
});

test("snapshot ที่เก่าลงไปมี log สั้นลงตามลำดับ", async () => {
  const graph = buildTimeGraph();
  await graph.invoke({}, cfg("t"));
  const lengths = (await allSnapshots(graph, "t")).map((s) => s.values.log?.length ?? 0);
  expect([...lengths].sort((x, y) => y - x)).toEqual(lengths);
});

test("findBefore('b') คือจุดที่ทำ a เสร็จแล้ว ยังไม่ทำ b", async () => {
  const graph = buildTimeGraph();
  await graph.invoke({}, cfg("t"));
  const snap = await findBefore(graph, "t", "b");
  expect(snap?.values.log).toEqual(["a"]);
});

test("findBefore ของ node ที่ไม่มี: undefined", async () => {
  const graph = buildTimeGraph();
  await graph.invoke({}, cfg("t"));
  expect(await findBefore(graph, "t", "zzz")).toBeUndefined();
});
