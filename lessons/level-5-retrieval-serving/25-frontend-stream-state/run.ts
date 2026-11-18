import { applyEvents, closeMarkdown, headline, initialUi, progressPercent, type StreamEvent } from "./ui";

// จำลองสตรีมที่ UI ได้รับ (รูปแบบเดียวกับ streamEvents v3 + channel จากบท 5-24) แล้วดูสถานะทีละขั้น
const ev = (method: string, data: unknown): StreamEvent => ({ method, params: { namespace: [], data } });
const stream: StreamEvent[] = [
  ev("lifecycle", { event: "running" }),
  ev("custom:node-status", { node: "plan", status: "running" }),
  ev("custom:node-status", { node: "plan", status: "complete" }),
  ev("custom:node-status", { node: "work", status: "running" }),
  ev("custom:node-status", { node: "work", status: "error", error: "boom" }),
  ev("lifecycle", { event: "failed", error: "boom" }),
];
let ui = initialUi();
for (const e of stream) {
  ui = applyEvents([e], ui);
  console.log(`${e.method.padEnd(20)} → ${headline(ui, 3)}  [${ui.nodes.map((n) => `${n.node}:${n.status}`).join(" ")}]  ${progressPercent(ui.nodes, 3)}%`);
}
console.log("\nmarkdown ที่ค้าง:", JSON.stringify("ขั้นตอน **สำคัญ ใช้ `npm i"), "→", JSON.stringify(closeMarkdown("ขั้นตอน **สำคัญ ใช้ `npm i")));
