import { buildObservedGraph, collectNodeStatuses, createNodeStatusTransformer, latestByNode, nodeStatusFromEvent } from "./channels";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) รัน graph จริงของ LangGraph ไม่ใช้เครือข่าย
const ev = (method: string, data: unknown, namespace: string[] = []) => ({ method, params: { namespace, data } });

test("nodeStatusFromEvent: เริ่ม/จบ/ล้มของ node", () => {
  expect(nodeStatusFromEvent(ev("tasks", { name: "a", input: { x: 1 } }))).toEqual({ node: "a", status: "running" });
  expect(nodeStatusFromEvent(ev("tasks", { name: "a", result: { x: 1 }, error: null }))).toEqual({ node: "a", status: "complete" });
  expect(nodeStatusFromEvent(ev("tasks", { name: "a", result: {}, error: "พัง" }))).toEqual({ node: "a", status: "error", error: "พัง" });
  expect(nodeStatusFromEvent(ev("tasks", { name: "a", error: new Error("boom") }))).toEqual({ node: "a", status: "error", error: "boom" });
});

test("nodeStatusFromEvent: result ที่เป็นค่าว่าง/falsy ยังนับว่าจบ", () => {
  expect(nodeStatusFromEvent(ev("tasks", { name: "a", result: null }))).toEqual({ node: "a", status: "complete" });
  expect(nodeStatusFromEvent(ev("tasks", { name: "a", result: 0 }))).toEqual({ node: "a", status: "complete" });
});

test("nodeStatusFromEvent: ข้ามสิ่งที่ไม่เกี่ยว (ชนิดอื่น, subgraph, ไม่มีชื่อ, ไม่มี input/result)", () => {
  expect(nodeStatusFromEvent(ev("values", { name: "a", input: {} }))).toBeNull();
  expect(nodeStatusFromEvent(ev("tasks", { name: "a", input: {} }, ["child:1"]))).toBeNull();
  expect(nodeStatusFromEvent(ev("tasks", { input: {} }))).toBeNull();
  expect(nodeStatusFromEvent(ev("tasks", { name: 5, input: {} }))).toBeNull();
  expect(nodeStatusFromEvent(ev("tasks", { name: "a" }))).toBeNull();
  expect(nodeStatusFromEvent(ev("tasks", undefined))).toBeNull();
});

test("graph จริงที่สำเร็จ: ได้ running→complete ของทุก node ตามลำดับ", async () => {
  const { statuses, failed } = await collectNodeStatuses(buildObservedGraph());
  expect(failed).toBe(false);
  expect(statuses).toEqual([
    { node: "plan", status: "running" },
    { node: "plan", status: "complete" },
    { node: "work", status: "running" },
    { node: "work", status: "complete" },
    { node: "report", status: "running" },
    { node: "report", status: "complete" },
  ]);
});

test("graph จริงที่ node work ล้ม: node นั้นถูกทำเครื่องหมาย error พร้อมข้อความ และไม่โยน error ออกมา", async () => {
  const { statuses, failed } = await collectNodeStatuses(buildObservedGraph("work"));
  expect(failed).toBe(true);
  expect(statuses).toEqual([
    { node: "plan", status: "running" },
    { node: "plan", status: "complete" },
    { node: "work", status: "running" },
    { node: "work", status: "error", error: "boom" },
  ]);
  expect(statuses.some((s) => s.node === "report")).toBe(false);
});

test("แต่ละการรันแยกสถานะกัน (transformer สร้างใหม่ต่อรอบ): รันที่ล้มแล้วรันที่ดีต่อไม่ติด error เก่า", async () => {
  await collectNodeStatuses(buildObservedGraph("plan"));
  const ok = await collectNodeStatuses(buildObservedGraph());
  expect(ok.statuses.every((s) => s.status !== "error")).toBe(true);
  const again = await collectNodeStatuses(buildObservedGraph("plan"));
  expect(again.statuses.filter((s) => s.status === "error")).toHaveLength(1);
});

test("graph เดียวกันรันซ้ำได้ผลเท่าเดิม", async () => {
  const g = buildObservedGraph();
  const first = await collectNodeStatuses(g);
  const second = await collectNodeStatuses(g);
  expect(second.statuses).toEqual(first.statuses);
});

test("latestByNode: สถานะล่าสุดต่อ node เรียงตามที่เห็นครั้งแรก", () => {
  expect(
    latestByNode([
      { node: "b", status: "running" },
      { node: "a", status: "running" },
      { node: "b", status: "complete" },
      { node: "a", status: "error", error: "x" },
    ]),
  ).toEqual([
    { node: "b", status: "complete" },
    { node: "a", status: "error", error: "x" },
  ]);
  expect(latestByNode([])).toEqual([]);
});

// Drive one transformer instance directly (no graph) and read back what it pushed.
const pushed = (ch: { size: number; get(i: number): unknown }) => Array.from({ length: ch.size }, (_, i) => ch.get(i));

test("K-m2: error that is present but falsy (e.g. empty string) still counts as error", () => {
  expect(nodeStatusFromEvent(ev("tasks", { name: "a", result: {}, error: "" }))).toEqual({ node: "a", status: "error", error: "" });
});

test("K-m3: key 'result' present with value undefined still counts as complete", () => {
  expect(nodeStatusFromEvent(ev("tasks", { name: "a", result: undefined }))).toEqual({ node: "a", status: "complete" });
});

test("K-m4: lifecycle failed of a subgraph (non-empty namespace) does not mark root nodes", () => {
  const t = createNodeStatusTransformer()();
  const { nodeStatus } = t.init();
  t.process(ev("tasks", { name: "a", input: {} }));
  t.process(ev("lifecycle", { event: "failed", error: "child boom" }, ["child:1"]));
  expect(pushed(nodeStatus)).toEqual([{ node: "a", status: "running" }]);
});

test("K-m5: process lets every event through (returns true) and the real stream still has standard events", async () => {
  const t = createNodeStatusTransformer()();
  t.init();
  for (const e of [ev("tasks", { name: "a", input: {} }), ev("values", { text: "x" }), ev("lifecycle", { event: "failed", error: "e" }), ev("weird", null)]) {
    expect(t.process(e)).toBe(true);
  }
  const run = await (buildObservedGraph() as unknown as { streamEvents: (i: object, o: object) => Promise<AsyncIterable<{ method: string }>> }).streamEvents({}, { version: "v3" });
  const methods = new Set<string>();
  for await (const e of run) methods.add(e.method);
  for (const m of ["lifecycle", "tasks", "values", "custom:node-status"]) expect(methods.has(m)).toBe(true);
});

test("K-m8: latestByNode keeps first-seen order even when an earlier node updates last", () => {
  expect(latestByNode([
    { node: "a", status: "running" },
    { node: "b", status: "running" },
    { node: "a", status: "complete" },
  ])).toEqual([
    { node: "a", status: "complete" },
    { node: "b", status: "running" },
  ]);
});

test("K-m10: running is cleared after failed (a later failed does not re-mark old nodes)", () => {
  const t = createNodeStatusTransformer()();
  const { nodeStatus } = t.init();
  t.process(ev("tasks", { name: "a", input: {} }));
  t.process(ev("lifecycle", { event: "failed", error: "x" }));
  t.process(ev("tasks", { name: "b", input: {} }));
  t.process(ev("lifecycle", { event: "failed", error: "y" }));
  expect(pushed(nodeStatus)).toEqual([
    { node: "a", status: "running" },
    { node: "a", status: "error", error: "x" },
    { node: "b", status: "running" },
    { node: "b", status: "error", error: "y" },
  ]);
});

test("K-m7/m7b/m11: each run's transformer has its own channel and running set (interleaved runs)", () => {
  const factory = createNodeStatusTransformer();
  const t1 = factory();
  const t2 = factory();
  const c1 = t1.init().nodeStatus;
  const c2 = t2.init().nodeStatus;
  t1.process(ev("tasks", { name: "a", input: {} }));
  t2.process(ev("tasks", { name: "b", input: {} }));
  t1.process(ev("lifecycle", { event: "failed", error: "x" }));
  t2.process(ev("lifecycle", { event: "failed", error: "y" }));
  expect(pushed(c1)).toEqual([{ node: "a", status: "running" }, { node: "a", status: "error", error: "x" }]);
  expect(pushed(c2)).toEqual([{ node: "b", status: "running" }, { node: "b", status: "error", error: "y" }]);
});
