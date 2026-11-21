import type { ProtocolEvent } from "@langchain/langgraph";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { demoRun, recordDemoEvents } from "@src/streamDemo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-08  (ไม่ใช้ LLM จริง: เอเจนต์ตัวอย่างใช้โมเดลปลอม และกราฟที่ล้มจริงหนึ่งตัว)
// เปลี่ยนเหตุการณ์ดิบเป็น "ความคืบหน้า" ที่หน้าจอใช้ได้ (node ไหนเริ่ม, tool ไหนทำอะไร, token, จบ, ล้ม) แบบ allowlist: ส่งออกเฉพาะฟิลด์ที่เลือก ห้ามปล่อย state หรืออินพุตของ node หลุดไปที่หน้าจอ
type Progress =
  | { type: "node"; node: string }
  | { type: "tool-start"; tool: string; input: string }
  | { type: "tool-end"; tool: string; output: string }
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

const isRoot = (ev: ProtocolEvent) => ev.params.namespace.length === 0;

function nodeProgress(ev: ProtocolEvent): Progress | null {
  if (ev.method !== "tasks" || !isRoot(ev)) return null;
  const data = ev.params.data as { name: string; input?: unknown };
  return "input" in data ? { type: "node", node: data.name } : null;
}

function toolProgress(ev: ProtocolEvent, names: Map<string, string>): Progress | null {
  if (ev.method !== "tools") return null;
  const data = ev.params.data as { event: string; tool_call_id: string; tool_name?: string; input?: string; output?: { content: unknown } };
  if (data.event === "tool-started") {
    names.set(data.tool_call_id, data.tool_name ?? "?");
    return { type: "tool-start", tool: data.tool_name ?? "?", input: String(data.input ?? "") };
  }
  if (data.event === "tool-finished") {
    const content = data.output?.content;
    return { type: "tool-end", tool: names.get(data.tool_call_id) ?? "?", output: typeof content === "string" ? content : JSON.stringify(content) };
  }
  return null;
}

// 👉 ข้อ 1 ช่อง "messages" ที่ data.event === "content-block-delta" และ data.delta.type === "text-delta"
//          และ data.delta.text ไม่ใช่สตริงว่าง → { type: "token", text } นอกนั้น null
function tokenProgress(ev: ProtocolEvent): Progress | null {
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   if (ev.method !== "messages") return null;
  //   const data = ev.params.data as { event?: string; delta?: { type?: string; text?: string } };
  //   if (data.event === "content-block-delta" && data.delta?.type === "text-delta" && data.delta.text) return { type: "token", text: data.delta.text };
  //   return null;
  return todo(1);
}

// (ให้ไว้แล้ว) กราฟหลักเท่านั้น: completed → done, failed → error
function lifecycleProgress(ev: ProtocolEvent): Progress | null {
  if (ev.method !== "lifecycle" || !isRoot(ev)) return null;
  const data = ev.params.data as { event: string; error?: string };
  if (data.event === "completed") return { type: "done" };
  if (data.event === "failed") return { type: "error", message: data.error ?? "ไม่ทราบสาเหตุ" };
  return null;
}

// ตัวแปลที่มีสถานะ (จำชื่อ tool) เหตุการณ์ที่ไม่รู้จักคืน null
function createMapper(): (ev: ProtocolEvent) => Progress | null {
  const names = new Map<string, string>();
  return (ev) => nodeProgress(ev) ?? toolProgress(ev, names) ?? tokenProgress(ev) ?? lifecycleProgress(ev);
}

async function* progressStream(run: AsyncIterable<ProtocolEvent>): AsyncGenerator<Progress> {
  const map = createMapper();
  let sentError = false;
  try {
    for await (const ev of run) {
      const progress = map(ev);
      if (!progress) continue;
      if (progress.type === "error") sentError = true;
      yield progress;
    }
  } catch (error) {
    if (!sentError) yield { type: "error", message: error instanceof Error ? error.message : String(error) };
  }
}

async function collect(run: AsyncIterable<ProtocolEvent>): Promise<Progress[]> {
  const out: Progress[] = [];
  for await (const p of progressStream(run)) out.push(p);
  return out;
}

// ส่วนที่ 1: เอเจนต์ตัวอย่าง: ลำดับความคืบหน้าที่หน้าจอเห็น
const steps = await collect(await demoRun());
steps.forEach((p) => console.log(p));

// ส่วนที่ 2: กราฟที่ล้มจริงต้องส่ง error หนึ่งครั้ง ไม่ throw ออกมา
const S = new StateSchema({ a: z.string().default("") });
const broken = new StateGraph(S)
  .addNode("boom", () => {
    throw new Error("พังแล้ว");
  })
  .addEdge(START, "boom")
  .addEdge("boom", END)
  .compile();
const failed = await collect(await broken.streamEvents({}, { version: "v3" }));












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const fake = (method: string, data: unknown, namespace: string[] = []): ProtocolEvent =>
  ({ type: "event", seq: 0, method, params: { namespace, timestamp: 0, data } }) as ProtocolEvent;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const events = await recordDemoEvents();
const json = JSON.stringify(events.map(createMapper()).filter(Boolean));
const leak = JSON.stringify(createMapper()(fake("tasks", { name: "ค้น", input: { password: "SECRET-123" } })));
const map = createMapper();
const delta = (d: unknown) => fake("messages", { event: "content-block-delta", index: 0, delta: d }, ["model_request:1"]);
const pair = createMapper();
pair(fake("tools", { event: "tool-started", tool_call_id: "1", tool_name: "ก", input: "{}" }));
pair(fake("tools", { event: "tool-started", tool_call_id: "2", tool_name: "ข", input: "{}" }));
async function* cut(): AsyncGenerator<ProtocolEvent> {
  yield fake("tasks", { name: "a", input: {} });
  throw new Error("เครือข่ายหลุด");
}

check(
  "เอเจนต์ตัวอย่าง: ลำดับความคืบหน้า node → tool → token → done",
  same(steps, [
    { type: "node", node: "model_request" },
    { type: "node", node: "tools" },
    { type: "tool-start", tool: "add", input: '{"a":1,"b":2}' },
    { type: "tool-end", tool: "add", output: "3" },
    { type: "node", node: "model_request" },
    { type: "token", text: "ผลคือ 3" },
    { type: "done" },
  ]),
);
check("allowlist: state, checkpoint และอินพุตของ node ไม่รั่วออกไป", !json.includes("HumanMessage") && !json.includes("checkpoint") && !json.includes('"lc"') && !leak.includes("SECRET-123"), "สร้างออบเจ็กต์ใหม่จากฟิลด์ที่เลือก อย่าส่ง data ทั้งก้อน");
check(
  "ตัวแปล: เหตุการณ์ที่ไม่รู้จักและงานใน namespace ย่อยคืน null",
  [
    map(fake("checkpoints", { step: 1 })),
    map(fake("values", { a: 1 })),
    map(fake("updates", { node: "a", values: {} })),
    map(fake("tasks", { name: "sub", input: {} }, ["sub:1"])),
    map(fake("tasks", { name: "a", result: {} })),
    map(fake("lifecycle", { event: "completed" }, ["sub:1"])),
    map(fake("lifecycle", { event: "running" })),
  ].every((r) => r === null),
);
check(
  "token: เฉพาะ text-delta ที่ไม่ว่าง",
  same(map(delta({ type: "text-delta", text: "ส" })), { type: "token", text: "ส" }) && map(delta({ type: "text-delta", text: "" })) === null && map(delta({ type: "reasoning-delta", text: "คิด" })) === null && map(fake("messages", { event: "message-start" }, ["model_request:1"])) === null,
);
check(
  "tool-end: จับคู่ชื่อด้วย tool_call_id (ผลสลับลำดับได้) และ id ที่ไม่เคยเห็นได้ ?",
  same(pair(fake("tools", { event: "tool-finished", tool_call_id: "2", output: { content: "ผลข" } })), { type: "tool-end", tool: "ข", output: "ผลข" }) &&
    (pair(fake("tools", { event: "tool-finished", tool_call_id: "9", output: { content: "?" } })) as { tool: string }).tool === "?" &&
    (pair(fake("tools", { event: "tool-finished", tool_call_id: "1", output: { content: [1] } })) as { output: string }).output === "[1]",
);
check("กราฟล้มจริง: ส่ง error หนึ่งครั้ง (ไม่ซ้ำ) และไม่ throw ออกมา", same(failed, [{ type: "node", node: "boom" }, { type: "error", message: "พังแล้ว" }]), "lifecycle failed มาก่อน throw จึงต้องจำว่าส่ง error ไปแล้ว");
check("ท่อที่ throw กลางทางโดยไม่มี lifecycle: ส่ง error ให้ครั้งเดียว", same(await collect(cut()), [{ type: "node", node: "a" }, { type: "error", message: "เครือข่ายหลุด" }]));
