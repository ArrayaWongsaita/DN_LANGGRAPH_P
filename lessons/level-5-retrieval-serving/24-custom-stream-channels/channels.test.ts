import { buildObservedGraph, collectNodeStatuses, latestByNode, nodeStatusFromEvent } from "./channels";

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
