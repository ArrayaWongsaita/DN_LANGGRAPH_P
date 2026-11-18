import type { ProtocolEvent } from "@langchain/langgraph";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { demoRun, recordDemoEvents } from "@src/streamDemo";
import { z } from "zod";
import { type Progress, createMapper, progressStream } from "./progress";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ใช้เอเจนต์จริง (โมเดลปลอม) และกราฟที่ล้มจริง
const fake = (method: string, data: unknown, namespace: string[] = []): ProtocolEvent =>
  ({ type: "event", seq: 0, method, params: { namespace, timestamp: 0, data } }) as ProtocolEvent;

async function collect(run: AsyncIterable<ProtocolEvent>): Promise<Progress[]> {
  const out: Progress[] = [];
  for await (const p of progressStream(run)) out.push(p);
  return out;
}

test("เอเจนต์จริง: ลำดับความคืบหน้าที่หน้าจอเห็น", async () => {
  expect(await collect(await demoRun())).toEqual([
    { type: "node", node: "model_request" },
    { type: "node", node: "tools" },
    { type: "tool-start", tool: "add", input: '{"a":1,"b":2}' },
    { type: "tool-end", tool: "add", output: "3" },
    { type: "node", node: "model_request" },
    { type: "token", text: "ผลคือ 3" },
    { type: "done" },
  ]);
});

test("allowlist: state, checkpoint และอินพุตของ node ไม่รั่วออกไป", async () => {
  const events = await recordDemoEvents();
  const mapper = createMapper();
  const json = JSON.stringify(events.map(mapper).filter(Boolean));
  expect(json).not.toContain("HumanMessage");
  expect(json).not.toContain("checkpoint");
  expect(json).not.toContain("lc");
  const secret = fake("tasks", { name: "ค้น", input: { password: "SECRET-123" } });
  expect(JSON.stringify(createMapper()(secret))).not.toContain("SECRET-123");
});

test("ตัวแปล: เหตุการณ์ที่ไม่รู้จักและงานใน namespace ย่อยคืน null", () => {
  const map = createMapper();
  expect(map(fake("checkpoints", { step: 1 }))).toBeNull();
  expect(map(fake("values", { a: 1 }))).toBeNull();
  expect(map(fake("updates", { node: "a", values: {} }))).toBeNull();
  expect(map(fake("tasks", { name: "sub", input: {} }, ["sub:1"]))).toBeNull();
  expect(map(fake("tasks", { name: "a", result: {} }))).toBeNull();
  expect(map(fake("lifecycle", { event: "completed" }, ["sub:1"]))).toBeNull();
  expect(map(fake("lifecycle", { event: "running" }))).toBeNull();
});

test("token: เฉพาะ text-delta ที่ไม่ว่าง", () => {
  const map = createMapper();
  const delta = (d: unknown) => fake("messages", { event: "content-block-delta", index: 0, delta: d }, ["model_request:1"]);
  expect(map(delta({ type: "text-delta", text: "ส" }))).toEqual({ type: "token", text: "ส" });
  expect(map(delta({ type: "text-delta", text: "" }))).toBeNull();
  expect(map(delta({ type: "reasoning-delta", text: "คิด" }))).toBeNull();
  expect(map(fake("messages", { event: "message-start" }, ["model_request:1"]))).toBeNull();
});

test("tool-end: จับคู่ชื่อด้วย tool_call_id (ผลสลับลำดับได้) และ id ที่ไม่เคยเห็นได้ ?", () => {
  const map = createMapper();
  map(fake("tools", { event: "tool-started", tool_call_id: "1", tool_name: "ก", input: "{}" }));
  map(fake("tools", { event: "tool-started", tool_call_id: "2", tool_name: "ข", input: "{}" }));
  expect(map(fake("tools", { event: "tool-finished", tool_call_id: "2", output: { content: "ผลข" } }))).toEqual({ type: "tool-end", tool: "ข", output: "ผลข" });
  expect(map(fake("tools", { event: "tool-finished", tool_call_id: "9", output: { content: "?" } }))).toMatchObject({ tool: "?" });
  expect(map(fake("tools", { event: "tool-finished", tool_call_id: "1", output: { content: [1] } }))).toMatchObject({ output: "[1]" });
});

test("กราฟล้มจริง: ส่ง error หนึ่งครั้ง (ไม่ซ้ำ) และไม่ throw ออกมา", async () => {
  const S = new StateSchema({ a: z.string().default("") });
  const g = new StateGraph(S)
    .addNode("boom", () => {
      throw new Error("พังแล้ว");
    })
    .addEdge(START, "boom")
    .addEdge("boom", END)
    .compile();
  const out = await collect(await g.streamEvents({}, { version: "v3" }));
  expect(out).toEqual([
    { type: "node", node: "boom" },
    { type: "error", message: "พังแล้ว" },
  ]);
});

test("ท่อที่ throw กลางทางโดยไม่มี lifecycle: ส่ง error ให้ครั้งเดียว", async () => {
  async function* broken(): AsyncGenerator<ProtocolEvent> {
    yield fake("tasks", { name: "a", input: {} });
    throw new Error("เครือข่ายหลุด");
  }
  expect(await collect(broken())).toEqual([
    { type: "node", node: "a" },
    { type: "error", message: "เครือข่ายหลุด" },
  ]);
});
