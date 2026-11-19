import { END, START, StateGraph, StateSchema, StreamChannel } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-24  (รัน graph จริงของ LangGraph ไม่ใช้ LLM ไม่ใช้เครือข่าย)
// custom stream channel: streamEvents v3 ให้ event มาตรฐาน (tasks, values, lifecycle...) แต่ UI มักอยากได้ "ข้อมูลที่ตัดแต่งแล้ว" เช่นสถานะของแต่ละ node บทนี้เขียน transformer ที่ดู event มาตรฐานแล้วดันข้อมูลของเราเข้า channel ใหม่ (ชื่อ "node-status") ซึ่งไหลมาใน stream เป็น event "custom:node-status" และถ้า graph ล้มกลางทาง node ที่ค้างอยู่ต้องถูกทำเครื่องหมาย error ด้วย

interface NodeStatus {
  node: string;
  status: "running" | "complete" | "error";
  error?: string;
}

interface ProtocolEvent {
  method: string;
  params: { namespace: string[]; data?: any };
}

// แปลง event ชนิด "tasks" ของ graph หลัก (namespace ว่าง) เป็นสถานะของ node
function nodeStatusFromEvent(event: ProtocolEvent): NodeStatus | null {
  // ข้อ 1: method ต้องเป็น "tasks", params.namespace ต้องว่าง และ data.name ต้องเป็นสตริง ไม่งั้นคืน null
  //          data.error ไม่ใช่ null/undefined → { node, status: "error", error: String(data.error?.message ?? data.error) }  (ตรวจข้อนี้ก่อน result)
  //          data มีคีย์ "result" → { node, status: "complete" }
  //          data มีคีย์ "input" → { node, status: "running" }   นอกนั้น null
  if (event.method !== "tasks" || event.params.namespace.length !== 0) return null;
  const data = event.params.data;
  if (!data || typeof data.name !== "string") return null;
  if (data.error !== undefined && data.error !== null) {
    return { node: data.name, status: "error", error: String(data.error?.message ?? data.error) };
  }
  if ("result" in data) return { node: data.name, status: "complete" };
  if ("input" in data) return { node: data.name, status: "running" };
  return null;
}

// factory ของ transformer (เรียกใหม่ทุกครั้งที่รัน เพื่อให้แต่ละการรันมี channel และสถานะของตัวเอง)
function createNodeStatusTransformer() {
  return () => {
    const channel = StreamChannel.remote<NodeStatus>("node-status");
    const running = new Set<string>();
    return {
      init: () => ({ nodeStatus: channel }),
      process(event: ProtocolEvent): boolean {
        // ข้อ 2: s = nodeStatusFromEvent(event) ถ้ามี → channel.push(s) และอัปเดต running
        //          (เพิ่มเมื่อ "running" ลบเมื่อ "complete"/"error")
        //          ถ้าเป็น event method "lifecycle" ของ namespace ว่างที่ data.event === "failed"
        //          → push { node, status: "error", error: String(data.error) } ให้ทุก node ที่ยังอยู่ใน running แล้วล้าง running
        //          ท้ายสุดคืน true เสมอ (ปล่อย event เดิมไหลต่อ)
        const s = nodeStatusFromEvent(event);
        if (s) {
          channel.push(s);
          if (s.status === "running") running.add(s.node);
          else running.delete(s.node);
        } else if (event.method === "lifecycle" && event.params.namespace.length === 0 && event.params.data?.event === "failed") {
          for (const node of running) channel.push({ node, status: "error", error: String(event.params.data.error) });
          running.clear();
        }
        return true;
      },
    };
  };
}

const State = new StateSchema({ text: z.string().default("") });

// graph plan → work → report ที่ติดตั้ง transformer; ถ้า failAt ตรงชื่อ node จะ throw Error("boom")
function buildObservedGraph(failAt?: string) {
  const step = (name: string) => () => {
    if (name === failAt) throw new Error("boom");
    return { text: name };
  };
  // ข้อ 3: new StateGraph(State) ใส่ node "plan", "work", "report" (ใช้ step(ชื่อ)) ต่อ START→plan→work→report→END
  //          compile({ transformers: [createNodeStatusTransformer()] })  (ชื่อ option คือ transformers)
  return new StateGraph(State)
    .addNode("plan", step("plan"))
    .addNode("work", step("work"))
    .addNode("report", step("report"))
    .addEdge(START, "plan")
    .addEdge("plan", "work")
    .addEdge("work", "report")
    .addEdge("report", END)
    .compile({ transformers: [createNodeStatusTransformer()] });
}

interface Collected {
  statuses: NodeStatus[];
  failed: boolean;
}

// รัน graph ด้วย streamEvents v3 เก็บข้อมูลจาก event "custom:node-status" (อยู่ที่ params.data) ตามลำดับ
async function collectNodeStatuses(graph: ReturnType<typeof buildObservedGraph>, input: object = {}): Promise<Collected> {
  const statuses: NodeStatus[] = [];
  let failed = false;
  // ข้อ 4: const run = await graph.streamEvents(input, { version: "v3" }); วนอ่าน event เก็บเฉพาะ method === "custom:node-status"
  //          ถ้าการวนอ่านโยน error (graph ล้ม) ให้จับไว้ ตั้ง failed = true แล้วคืนผลที่เก็บได้ (ห้ามโยนต่อ)
  try {
    const run = await (graph as unknown as { streamEvents: (i: object, o: object) => Promise<AsyncIterable<ProtocolEvent>> }).streamEvents(input, { version: "v3" });
    for await (const event of run) if (event.method === "custom:node-status") statuses.push(event.params.data as NodeStatus);
  } catch {
    failed = true;
  }
  return { statuses, failed };
}

// สถานะล่าสุดของแต่ละ node เรียงตามลำดับที่เห็น node ครั้งแรก
function latestByNode(statuses: NodeStatus[]): NodeStatus[] {
  // ข้อ 5: คืนสถานะล่าสุดต่อ node (Map ที่ set ซ้ำคงตำแหน่งแรกไว้)
  const byNode = new Map<string, NodeStatus>();
  for (const s of statuses) byNode.set(s.node, s);
  return [...byNode.values()];
}

// ส่วนที่ 1: รัน graph จริงสองแบบ (สำเร็จ / node work ล้ม)
const okRun = await collectNodeStatuses(buildObservedGraph());
const failRun = await collectNodeStatuses(buildObservedGraph("work"));
for (const [label, run] of [["สำเร็จ", okRun], ["node work ล้ม", failRun]] as const) {
  console.log(`\nรัน${label} (failed=${run.failed})`);
  console.log(" event custom:node-status:", run.statuses.map((s) => `${s.node}:${s.status}`).join(" "));
  console.log(" สถานะล่าสุด:", JSON.stringify(latestByNode(run.statuses)));
}

// ส่วนที่ 2: ตรวจเพิ่ม (รันซ้ำและ transformer แยกต่อรอบ)
await collectNodeStatuses(buildObservedGraph("plan"));
const afterFail = await collectNodeStatuses(buildObservedGraph());
const again = await collectNodeStatuses(buildObservedGraph("plan"));
const reused = buildObservedGraph();
const first = await collectNodeStatuses(reused);
const second = await collectNodeStatuses(reused);
const ev = (method: string, data: unknown, namespace: string[] = []): ProtocolEvent => ({ method, params: { namespace, data } });
const pushed = (ch: { size: number; get(i: number): unknown }) => Array.from({ length: ch.size }, (_, i) => ch.get(i));
const t1 = createNodeStatusTransformer()();
const sub = t1.init().nodeStatus;
t1.process(ev("tasks", { name: "a", input: {} }));
t1.process(ev("lifecycle", { event: "failed", error: "child boom" }, ["child:1"]));
const subPushed = pushed(sub);
const t2 = createNodeStatusTransformer()();
const ch2 = t2.init().nodeStatus;
t2.process(ev("tasks", { name: "a", input: {} }));
t2.process(ev("lifecycle", { event: "failed", error: "x" }));
t2.process(ev("tasks", { name: "b", input: {} }));
t2.process(ev("lifecycle", { event: "failed", error: "y" }));
const factory = createNodeStatusTransformer();
const f1 = factory();
const f2 = factory();
const fc1 = f1.init().nodeStatus;
const fc2 = f2.init().nodeStatus;
f1.process(ev("tasks", { name: "a", input: {} }));
f2.process(ev("tasks", { name: "b", input: {} }));
f1.process(ev("lifecycle", { event: "failed", error: "x" }));
f2.process(ev("lifecycle", { event: "failed", error: "y" }));
const t3 = createNodeStatusTransformer()();
t3.init();
const passes = [ev("tasks", { name: "a", input: {} }), ev("values", { text: "x" }), ev("lifecycle", { event: "failed", error: "e" }), ev("weird", null)].map((e) => t3.process(e));
const methods = new Set<string>();
for await (const e of await (buildObservedGraph() as unknown as { streamEvents: (i: object, o: object) => Promise<AsyncIterable<{ method: string }>> }).streamEvents({}, { version: "v3" })) methods.add(e.method);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("nodeStatusFromEvent: เริ่ม/จบ/ล้มของ node", same(nodeStatusFromEvent(ev("tasks", { name: "a", input: { x: 1 } })), { node: "a", status: "running" }) && same(nodeStatusFromEvent(ev("tasks", { name: "a", result: { x: 1 }, error: null })), { node: "a", status: "complete" }) && same(nodeStatusFromEvent(ev("tasks", { name: "a", result: {}, error: "พัง" })), { node: "a", status: "error", error: "พัง" }) && same(nodeStatusFromEvent(ev("tasks", { name: "a", error: new Error("boom") })), { node: "a", status: "error", error: "boom" }));
check("nodeStatusFromEvent: result ที่เป็นค่าว่าง/falsy ยังนับว่าจบ และ error ที่เป็นสตริงว่างยังนับว่า error", same(nodeStatusFromEvent(ev("tasks", { name: "a", result: null })), { node: "a", status: "complete" }) && same(nodeStatusFromEvent(ev("tasks", { name: "a", result: 0 })), { node: "a", status: "complete" }) && same(nodeStatusFromEvent(ev("tasks", { name: "a", result: undefined })), { node: "a", status: "complete" }) && same(nodeStatusFromEvent(ev("tasks", { name: "a", result: {}, error: "" })), { node: "a", status: "error", error: "" }));
check("nodeStatusFromEvent: ข้ามสิ่งที่ไม่เกี่ยว (ชนิดอื่น, subgraph, ไม่มีชื่อ, ไม่มี input/result)", [ev("values", { name: "a", input: {} }), ev("tasks", { name: "a", input: {} }, ["child:1"]), ev("tasks", { input: {} }), ev("tasks", { name: 5, input: {} }), ev("tasks", { name: "a" }), ev("tasks", undefined)].every((e) => nodeStatusFromEvent(e) === null));
check("graph จริงที่สำเร็จ: ได้ running→complete ของทุก node ตามลำดับ", !okRun.failed && same(okRun.statuses, [{ node: "plan", status: "running" }, { node: "plan", status: "complete" }, { node: "work", status: "running" }, { node: "work", status: "complete" }, { node: "report", status: "running" }, { node: "report", status: "complete" }]));
check("graph จริงที่ node work ล้ม: ทำเครื่องหมาย error พร้อมข้อความ และไม่โยน error ออกมา", failRun.failed && same(failRun.statuses, [{ node: "plan", status: "running" }, { node: "plan", status: "complete" }, { node: "work", status: "running" }, { node: "work", status: "error", error: "boom" }]) && !failRun.statuses.some((s) => s.node === "report"));
check("แต่ละการรันแยกสถานะกัน: รันที่ล้มแล้วรันที่ดีต่อไม่ติด error เก่า", afterFail.statuses.every((s) => s.status !== "error") && again.statuses.filter((s) => s.status === "error").length === 1, "transformer ต้องสร้างใหม่ทุกรอบ (factory)");
check("graph เดียวกันรันซ้ำได้ผลเท่าเดิม", same(second.statuses, first.statuses));
check("lifecycle failed ของ subgraph (namespace ไม่ว่าง) ไม่ทำเครื่องหมาย node ของ graph หลัก", same(subPushed, [{ node: "a", status: "running" }]));
check("running ถูกล้างหลัง failed (failed รอบหลังไม่ทำเครื่องหมาย node เก่าซ้ำ)", same(pushed(ch2), [{ node: "a", status: "running" }, { node: "a", status: "error", error: "x" }, { node: "b", status: "running" }, { node: "b", status: "error", error: "y" }]));
check("transformer สองตัวที่รันสลับกันมี channel และ running เป็นของตัวเอง", same(pushed(fc1), [{ node: "a", status: "running" }, { node: "a", status: "error", error: "x" }]) && same(pushed(fc2), [{ node: "b", status: "running" }, { node: "b", status: "error", error: "y" }]));
check("process ปล่อยทุก event ไหลต่อ (คืน true) และ stream จริงยังมี event มาตรฐานครบ", passes.every((p) => p === true) && ["lifecycle", "tasks", "values", "custom:node-status"].every((m) => methods.has(m)));
check("latestByNode: สถานะล่าสุดต่อ node เรียงตามที่เห็นครั้งแรก", same(latestByNode([{ node: "b", status: "running" }, { node: "a", status: "running" }, { node: "b", status: "complete" }, { node: "a", status: "error", error: "x" }]), [{ node: "b", status: "complete" }, { node: "a", status: "error", error: "x" }]) && same(latestByNode([]), []) && same(latestByNode([{ node: "a", status: "running" }, { node: "b", status: "running" }, { node: "a", status: "complete" }]), [{ node: "a", status: "complete" }, { node: "b", status: "running" }]));
