import { END, START, StateGraph, StateSchema, StreamChannel } from "@langchain/langgraph";
import { z } from "zod";
import { type StreamEvent, applyEvents, closeMarkdown, headline, initialUi, progressPercent, reduceUi } from "./ui";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
const ev = (method: string, data: unknown, namespace: string[] = []): StreamEvent => ({ method, params: { namespace, data } });
const node = (n: string, status: string, error?: string) => ev("custom:node-status", { node: n, status, ...(error ? { error } : {}) });

test("lifecycle ของ graph หลักกำหนดสถานะรวม", () => {
  let s = reduceUi(initialUi(), ev("lifecycle", { event: "running" }));
  expect(s.status).toBe("running");
  expect(reduceUi(s, ev("lifecycle", { event: "completed" })).status).toBe("complete");
  const failed = reduceUi(s, ev("lifecycle", { event: "failed", error: "boom" }));
  expect(failed).toMatchObject({ status: "error", error: "boom" });
  s = reduceUi(failed, ev("lifecycle", { event: "running" }));
  expect(s).toMatchObject({ status: "running", error: undefined }); // รันใหม่ล้าง error เก่า
});

test("event ของ subgraph (namespace ไม่ว่าง) ไม่เปลี่ยนสถานะรวมและ values", () => {
  const s0 = initialUi();
  expect(reduceUi(s0, ev("lifecycle", { event: "failed", error: "x" }, ["child:1"]))).toBe(s0);
  expect(reduceUi(s0, ev("values", { a: 1 }, ["child:1"]))).toBe(s0);
});

test("values เก็บค่าล่าสุด", () => {
  const s = applyEvents([ev("values", { text: "a" }), ev("values", { text: "b" })]);
  expect(s.values).toEqual({ text: "b" });
});

test("node-status: ต่อท้ายตามลำดับที่เห็น แทนที่ตำแหน่งเดิมเมื่อสถานะเปลี่ยน", () => {
  const s = applyEvents([node("a", "running"), node("b", "running"), node("a", "complete"), node("c", "running")]);
  expect(s.nodes.map((n) => `${n.node}:${n.status}`)).toEqual(["a:complete", "b:running", "c:running"]);
});

test("node-status: เก็บข้อความ error และข้ามข้อมูลผิดรูป", () => {
  const s = applyEvents([node("a", "error", "พัง")]);
  expect(s.nodes).toEqual([{ node: "a", status: "error", error: "พัง" }]);
  const base = applyEvents([node("a", "running")]);
  for (const bad of [{ node: 5, status: "running" }, { node: "x", status: "weird" }, { status: "running" }, null, undefined]) {
    expect(reduceUi(base, ev("custom:node-status", bad))).toBe(base);
  }
});

test("reducer ไม่แก้ state เดิม (immutable) และ event ที่ไม่เกี่ยวคืนอ็อบเจ็กต์เดิม", () => {
  const before = applyEvents([node("a", "running")]);
  const snapshot = JSON.parse(JSON.stringify(before));
  const after = reduceUi(before, node("a", "complete"));
  expect(before).toEqual(snapshot);
  expect(after).not.toBe(before);
  expect(after.nodes).not.toBe(before.nodes);
  for (const e of [ev("tasks", { name: "a" }), ev("updates", {}), ev("checkpoints", {}), ev("custom:other", { x: 1 })]) {
    expect(reduceUi(before, e)).toBe(before);
  }
});

test("progressPercent: คิดจาก node ที่เสร็จ / จำนวนที่คาดไว้ (graph ไดนามิก)", () => {
  const nodes = [
    { node: "a", status: "complete" as const },
    { node: "b", status: "running" as const },
    { node: "c", status: "error" as const },
  ];
  expect(progressPercent(nodes, 4)).toBe(25);
  expect(progressPercent(nodes, 3)).toBe(33);
  expect(progressPercent([], 4)).toBe(0);
  expect(progressPercent(nodes, 1)).toBe(100);
  expect(progressPercent(nodes, 0)).toBe(100); // expectedTotal < 1 ถือเป็น 1
  expect(progressPercent(nodes, -5)).toBe(100);
  expect(progressPercent([{ node: "a", status: "complete" }, { node: "b", status: "complete" }, { node: "c", status: "complete" }], 2)).toBe(100); // ไม่เกิน 100
});

test("closeMarkdown: โค้ดบล็อกที่ค้าง ถูกปิดโดยไม่แตะเรื่องอื่นในบล็อก", () => {
  expect(closeMarkdown("ตัวอย่าง:\n```ts\nconst a = **")).toBe("ตัวอย่าง:\n```ts\nconst a = **\n```");
  expect(closeMarkdown("```ts\nx\n")).toBe("```ts\nx\n```");
  expect(closeMarkdown("a ```x``` b ```y")).toBe("a ```x``` b ```y\n```");
});

test("closeMarkdown: ตัวหนาและโค้ดบรรทัดเดียวที่ค้าง ถูกปิด", () => {
  expect(closeMarkdown("นี่คือ **สำคัญ")).toBe("นี่คือ **สำคัญ**");
  expect(closeMarkdown("เรียก `fn(")).toBe("เรียก `fn(`");
  expect(closeMarkdown("**หนา `โค้ด")).toBe("**หนา `โค้ด**`");
});

test("closeMarkdown: ข้อความที่ครบแล้วคืนเหมือนเดิม (รวมโค้ดบล็อกที่ปิดครบกับ backtick ในนั้น)", () => {
  for (const ok of ["", "ปกติ", "**หนา** และ `โค้ด`", "```ts\nconst a = `x`;\n```", "ข้อความ ```a``` จบ"]) {
    expect(closeMarkdown(ok)).toBe(ok);
  }
});

test("headline: แต่ละสถานะ", () => {
  expect(headline(initialUi(), 3)).toBe("พร้อม");
  const running = applyEvents([ev("lifecycle", { event: "running" }), node("a", "complete"), node("b", "running"), node("c", "running")]);
  expect(headline(running, 4)).toBe("กำลังทำงาน 25% (b, c)");
  expect(headline(applyEvents([ev("lifecycle", { event: "running" })]), 4)).toBe("กำลังทำงาน 0%");
  expect(headline(applyEvents([ev("lifecycle", { event: "completed" })]), 4)).toBe("เสร็จแล้ว");
  expect(headline(applyEvents([ev("lifecycle", { event: "failed", error: "boom" })]), 4)).toBe("ล้มเหลว: boom");
  expect(headline({ ...initialUi(), status: "error" }, 4)).toBe("ล้มเหลว: ไม่ทราบสาเหตุ");
});

test("ต่อกับสตรีมจริงของ LangGraph: UI จบที่ complete พร้อม values และสถานะ node ครบ", async () => {
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
  let ui = initialUi();
  const run = await (graph as unknown as { streamEvents: (i: object, o: object) => Promise<AsyncIterable<StreamEvent>> }).streamEvents({}, { version: "v3" });
  for await (const e of run) ui = reduceUi(ui, e);
  expect(ui.status).toBe("complete");
  expect(ui.values).toEqual({ text: "B" });
  expect(ui.nodes.map((n) => `${n.node}:${n.status}`)).toEqual(["a:complete", "b:complete"]);
  expect(progressPercent(ui.nodes, 2)).toBe(100);
});


test("K-m2: root lifecycle events we do not handle (interrupted/started/no data) return the same object", () => {
  const s = applyEvents([ev("lifecycle", { event: "running" }), node("a", "running")]);
  for (const e of [ev("lifecycle", { event: "interrupted" }), ev("lifecycle", { event: "started" }), ev("lifecycle", undefined)]) {
    expect(reduceUi(s, e)).toBe(s);
  }
});

test("K-m3: appending a new node does not mutate the previous state's nodes array", () => {
  const before = applyEvents([node("a", "running")]);
  const after = reduceUi(before, node("b", "running"));
  expect(before.nodes).toEqual([{ node: "a", status: "running" }]);
  expect(after.nodes).not.toBe(before.nodes);
  expect(after.nodes.map((n) => n.node)).toEqual(["a", "b"]);
});

test("K-m4: a later status replaces the node view entirely (old error does not stick)", () => {
  const s = applyEvents([node("a", "error", "พัง"), node("a", "running")]);
  expect(s.nodes).toEqual([{ node: "a", status: "running" }]);
});

test("K-m5: values replaces the whole snapshot (keys missing from the new snapshot disappear)", () => {
  const s = applyEvents([ev("values", { a: 1, b: 2 }), ev("values", { b: 3 })]);
  expect(s.values).toEqual({ b: 3 });
});

test("K-m6: progressPercent rounds to nearest, not down (2/3 -> 67)", () => {
  const nodes = [
    { node: "a", status: "complete" as const },
    { node: "b", status: "complete" as const },
    { node: "c", status: "running" as const },
  ];
  expect(progressPercent(nodes, 3)).toBe(67);
});

test("K-m8: complete text is returned byte-for-byte, including trailing whitespace/newlines", () => {
  for (const ok of ["บรรทัดแรก\n", "จบด้วยช่องว่าง ", "**หนา**\n\n", "```ts\nx\n```\n"]) {
    expect(closeMarkdown(ok)).toBe(ok);
  }
});
