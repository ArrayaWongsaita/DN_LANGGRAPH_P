import { buildTimeGraph, cfg } from "./travel";
import { forkFrom, replayFrom } from "./travel";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
test("replay จากก่อน b: ได้ผลเหมือนเดิม (a, b, c) โดย a ไม่ถูกทำซ้ำ", async () => {
  const graph = buildTimeGraph();
  await graph.invoke({}, cfg("t"));
  expect(await replayFrom(graph, "t", "b")).toEqual(["a", "b", "c"]);
});

test("fork จากก่อน b: แทรก X ระหว่าง a กับ b", async () => {
  const graph = buildTimeGraph();
  await graph.invoke({}, cfg("t"));
  expect(await forkFrom(graph, "t", "b", "X")).toEqual(["a", "X", "b", "c"]);
});

test("fork ไม่ทำลายเส้นเดิม: ประวัติใหม่เกิดขึ้น แต่ replay ก่อนหน้ายังใช้ได้", async () => {
  const graph = buildTimeGraph();
  await graph.invoke({}, cfg("t"));
  await forkFrom(graph, "t", "b", "X");
  expect(await replayFrom(graph, "t", "c")).toEqual(expect.arrayContaining(["a", "b", "c"]));
});
