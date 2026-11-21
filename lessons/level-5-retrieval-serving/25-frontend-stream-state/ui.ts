import { END, START, StateGraph, StateSchema, StreamChannel } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-25  (ไม่ใช้ LLM ไม่ใช้เครือข่าย)
// สถานะ UI จากสตรีม ไม่ผูกกับเฟรมเวิร์ก: หน้าเว็บ (React/Vue/Svelte...) ต้องแปลง event ที่ไหลมาเป็น "สถานะที่วาดได้" ด้วย reducer ล้วน ๆ (state เดิม + event → state ใหม่ ห้ามแก้ของเดิม) บทนี้เขียนส่วนนั้น: สถานะรวมและ node, เปอร์เซ็นต์ความคืบหน้าของ graph ที่ไม่รู้จำนวน node ล่วงหน้า, ปิดมาร์กดาวน์ที่ยังพิมพ์ไม่จบเพื่อเรนเดอร์ชั่วคราว และข้อความหัวแถบ ส่วน hook สำเร็จรูป (useStream ฯลฯ) อธิบายเฉย ๆ ไม่รัน

type NodeState = "running" | "complete" | "error";

interface NodeView {
  node: string;
  status: NodeState;
  error?: string;
}

interface UiState {
  status: "idle" | "running" | "complete" | "error";
  nodes: NodeView[]; // เรียงตามลำดับที่เห็น node ครั้งแรก
  values: Record<string, unknown> | undefined;
  error?: string;
}

interface StreamEvent {
  method: string;
  params: { namespace: string[]; data?: any };
}

function initialUi(): UiState {
  return { status: "idle", nodes: [], values: undefined };
}

// ลดรูป event ทีละตัวเป็นสถานะ UI ใหม่ (ห้ามแก้ state เดิม)
function reduceUi(state: UiState, event: StreamEvent): UiState {
  const root = event.params.namespace.length === 0;
  const data = event.params.data;


  if (root && event.method === "lifecycle") {
    if (data?.event === "running") return { ...state, status: "running", error: undefined };
    if (data?.event === "completed") return { ...state, status: "complete" };
    if (data?.event === "failed") return { ...state, status: "error", error: String(data.error) };
    return state;
  }
  if (root && event.method === "values") return { ...state, values: data };

  if (event.method === "custom:node-status") {
    const ok = data && typeof data.node === "string" && ["running", "complete", "error"].includes(data.status);
    if (!ok) return state;
    const view: NodeView = { node: data.node, status: data.status, ...(data.error !== undefined ? { error: data.error } : {}) };
    const index = state.nodes.findIndex((n) => n.node === data.node);
    const nodes = index === -1 ? [...state.nodes, view] : state.nodes.map((n, i) => (i === index ? view : n));
    return { ...state, nodes };
  }
  return state;
}

// เปอร์เซ็นต์ความคืบหน้า: จำนวน node ที่ "complete" / expectedTotal ปัดเป็นจำนวนเต็ม ไม่เกิน 100
function progressPercent(nodes: NodeView[], expectedTotal: number): number {
  // 👉 ข้อ 1 expectedTotal < 1 ให้ถือเป็น 1 (กันหารด้วยศูนย์) คิดจากเฉพาะ node ที่ complete ปัดเศษแบบใกล้สุด (2/3 → 67)
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   const total = Math.max(1, expectedTotal);
  //   const done = nodes.filter((n) => n.status === "complete").length;
  //   return Math.min(100, Math.round((done / total) * 100));
  return todo(1);
}

const count = (text: string, token: string) => text.split(token).length - 1;

// ปิดโครงสร้าง markdown ที่ค้างอยู่เพื่อให้เรนเดอร์ชั่วคราวได้
function closeMarkdown(partial: string): string {
  if (count(partial, "```") % 2 === 1) return partial.endsWith("\n") ? `${partial}\`\`\`` : `${partial}\n\`\`\``;
  let out = partial;
  const withoutFences = partial.replaceAll("```", "");
  if (count(withoutFences, "**") % 2 === 1) out += "**";
  if (count(withoutFences.replaceAll("**", ""), "`") % 2 === 1) out += "`";
  return out;
}

// (ให้ไว้แล้ว) เรียก reduceUi ต่อเนื่องกับ event หลายตัว
function applyEvents(events: StreamEvent[], from: UiState = initialUi()): UiState {
  return events.reduce(reduceUi, from);
}

// ข้อความสถานะสั้น ๆ สำหรับหัวแถบ
function headline(ui: UiState, expectedTotal: number): string {
  if (ui.status === "error") return `ล้มเหลว: ${ui.error ?? "ไม่ทราบสาเหตุ"}`;
  if (ui.status === "complete") return "เสร็จแล้ว";
  if (ui.status === "idle") return "พร้อม";
  const running = ui.nodes.filter((n) => n.status === "running").map((n) => n.node);
  return `กำลังทำงาน ${progressPercent(ui.nodes, expectedTotal)}%${running.length ? ` (${running.join(", ")})` : ""}`;
}

// ส่วนที่ 1: จำลองสตรีมที่ UI ได้รับ (รูปแบบเดียวกับ streamEvents v3 + channel จากบท 5-24) แล้วดูสถานะทีละขั้น
const ev = (method: string, data: unknown, namespace: string[] = []): StreamEvent => ({ method, params: { namespace, data } });
const node = (n: string, status: string, error?: string) => ev("custom:node-status", { node: n, status, ...(error ? { error } : {}) });
const scripted: StreamEvent[] = [
  ev("lifecycle", { event: "running" }),
  node("plan", "running"),
  node("plan", "complete"),
  node("work", "running"),
  node("work", "error", "boom"),
  ev("lifecycle", { event: "failed", error: "boom" }),
];
let shown = initialUi();
for (const e of scripted) {
  shown = applyEvents([e], shown);
  console.log(`${e.method.padEnd(20)} → ${headline(shown, 3)}  [${shown.nodes.map((n) => `${n.node}:${n.status}`).join(" ")}]  ${progressPercent(shown.nodes, 3)}%`);
}
console.log("\nmarkdown ที่ค้าง:", JSON.stringify("ขั้นตอน **สำคัญ ใช้ `npm i"), "→", JSON.stringify(closeMarkdown("ขั้นตอน **สำคัญ ใช้ `npm i")));

// ส่วนที่ 2: ต่อกับสตรีมจริงของ LangGraph (transformer สร้าง channel "node-status" แบบย่อ)
const State = new StateSchema({ text: z.string().default("") });
const channel = StreamChannel.remote<{ node: string; status: string }>("node-status");
const graph = new StateGraph(State)
  .addNode("a", () => ({ text: "A" }))
  .addNode("b", () => ({ text: "B" }))
  .addEdge(START, "a")
  .addEdge("a", "b")
  .addEdge("b", END)
  .compile({
    transformers: [
      () => ({
        init: () => ({ nodeStatus: channel }),
        process(e: StreamEvent) {
          const d = e.params.data;
          if (e.method === "tasks" && e.params.namespace.length === 0 && typeof d?.name === "string") {
            if ("result" in d) channel.push({ node: d.name, status: "complete" });
            else if ("input" in d) channel.push({ node: d.name, status: "running" });
          }
          return true;
        },
      }),
    ],
  } as never);
let live = initialUi();
const run = await (graph as unknown as { streamEvents: (i: object, o: object) => Promise<AsyncIterable<StreamEvent>> }).streamEvents({}, { version: "v3" });
for await (const e of run) live = reduceUi(live, e);
console.log("สตรีมจริง:", headline(live, 2), JSON.stringify(live.values));












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const started = reduceUi(initialUi(), ev("lifecycle", { event: "running" }));
const failedUi = reduceUi(started, ev("lifecycle", { event: "failed", error: "boom" }));
const rerun = reduceUi(failedUi, ev("lifecycle", { event: "running" }));
const s0 = initialUi();
const mixed = applyEvents([node("a", "running"), node("b", "running"), node("a", "complete"), node("c", "running")]);
const base = applyEvents([node("a", "running")]);
const snapshot = JSON.parse(JSON.stringify(base));
const afterComplete = reduceUi(base, node("a", "complete"));
const appended = reduceUi(base, node("b", "running"));
const runningUi = applyEvents([ev("lifecycle", { event: "running" }), node("a", "complete"), node("b", "running"), node("c", "running")]);
const prog = [{ node: "a", status: "complete" as const }, { node: "b", status: "running" as const }, { node: "c", status: "error" as const }];
check("lifecycle ของ graph หลักกำหนดสถานะรวม (รันใหม่ล้าง error เก่า)", started.status === "running" && reduceUi(started, ev("lifecycle", { event: "completed" })).status === "complete" && failedUi.status === "error" && failedUi.error === "boom" && rerun.status === "running" && rerun.error === undefined);
check("event ของ subgraph (namespace ไม่ว่าง) ไม่เปลี่ยนสถานะรวมและ values", reduceUi(s0, ev("lifecycle", { event: "failed", error: "x" }, ["child:1"])) === s0 && reduceUi(s0, ev("values", { a: 1 }, ["child:1"])) === s0);
check("values เก็บค่าล่าสุดทั้งก้อน (คีย์ที่หายไปในก้อนใหม่หายด้วย)", same(applyEvents([ev("values", { text: "a" }), ev("values", { text: "b" })]).values, { text: "b" }) && same(applyEvents([ev("values", { a: 1, b: 2 }), ev("values", { b: 3 })]).values, { b: 3 }));
check("node-status: ต่อท้ายตามลำดับที่เห็น แทนที่ตำแหน่งเดิมเมื่อสถานะเปลี่ยน", same(mixed.nodes.map((n) => `${n.node}:${n.status}`), ["a:complete", "b:running", "c:running"]));
check("node-status: เก็บข้อความ error ข้ามข้อมูลผิดรูป และสถานะใหม่ล้าง error เก่า", same(applyEvents([node("a", "error", "พัง")]).nodes, [{ node: "a", status: "error", error: "พัง" }]) && [{ node: 5, status: "running" }, { node: "x", status: "weird" }, { status: "running" }, null, undefined].every((bad) => reduceUi(base, ev("custom:node-status", bad)) === base) && same(applyEvents([node("a", "error", "พัง"), node("a", "running")]).nodes, [{ node: "a", status: "running" }]));
check("reducer ไม่แก้ state เดิม (immutable) และ event ที่ไม่เกี่ยวคืนอ็อบเจ็กต์เดิม", same(base, snapshot) && afterComplete !== base && afterComplete.nodes !== base.nodes && appended.nodes !== base.nodes && same(base.nodes, [{ node: "a", status: "running" }]) && [ev("tasks", { name: "a" }), ev("updates", {}), ev("checkpoints", {}), ev("custom:other", { x: 1 }), ev("lifecycle", { event: "interrupted" }), ev("lifecycle", undefined)].every((e) => reduceUi(base, e) === base));
check("progressPercent: คิดจาก node ที่เสร็จ / จำนวนที่คาดไว้ ปัดใกล้สุด ไม่เกิน 100", progressPercent(prog, 4) === 25 && progressPercent(prog, 3) === 33 && progressPercent([], 4) === 0 && progressPercent(prog, 1) === 100 && progressPercent(prog, 0) === 100 && progressPercent(prog, -5) === 100 && progressPercent([{ node: "a", status: "complete" }, { node: "b", status: "complete" }, { node: "c", status: "complete" }], 2) === 100 && progressPercent([{ node: "a", status: "complete" }, { node: "b", status: "complete" }, { node: "c", status: "running" }], 3) === 67);
check("closeMarkdown: โค้ดบล็อกที่ค้างถูกปิดโดยไม่แตะเรื่องอื่นในบล็อก", closeMarkdown("ตัวอย่าง:\n```ts\nconst a = **") === "ตัวอย่าง:\n```ts\nconst a = **\n```" && closeMarkdown("```ts\nx\n") === "```ts\nx\n```" && closeMarkdown("a ```x``` b ```y") === "a ```x``` b ```y\n```");
check("closeMarkdown: ตัวหนาและโค้ดบรรทัดเดียวที่ค้างถูกปิด", closeMarkdown("นี่คือ **สำคัญ") === "นี่คือ **สำคัญ**" && closeMarkdown("เรียก `fn(") === "เรียก `fn(`" && closeMarkdown("**หนา `โค้ด") === "**หนา `โค้ด**`");
check("closeMarkdown: ข้อความที่ครบแล้วคืนเหมือนเดิมทุกตัวอักษร", ["", "ปกติ", "**หนา** และ `โค้ด`", "```ts\nconst a = `x`;\n```", "ข้อความ ```a``` จบ", "บรรทัดแรก\n", "จบด้วยช่องว่าง ", "**หนา**\n\n", "```ts\nx\n```\n"].every((ok) => closeMarkdown(ok) === ok));
check("headline: แต่ละสถานะ", headline(initialUi(), 3) === "พร้อม" && headline(runningUi, 4) === "กำลังทำงาน 25% (b, c)" && headline(applyEvents([ev("lifecycle", { event: "running" })]), 4) === "กำลังทำงาน 0%" && headline(applyEvents([ev("lifecycle", { event: "completed" })]), 4) === "เสร็จแล้ว" && headline(failedUi, 4) === "ล้มเหลว: boom" && headline({ ...initialUi(), status: "error" }, 4) === "ล้มเหลว: ไม่ทราบสาเหตุ");
check("ต่อกับสตรีมจริงของ LangGraph: UI จบที่ complete พร้อม values และสถานะ node ครบ", live.status === "complete" && same(live.values, { text: "B" }) && same(live.nodes.map((n) => `${n.node}:${n.status}`), ["a:complete", "b:complete"]) && progressPercent(live.nodes, 2) === 100);
