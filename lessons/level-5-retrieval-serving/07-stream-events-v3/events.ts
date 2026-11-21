import type { ProtocolEvent } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { recordDemoEvents } from "@src/streamDemo";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-07  (ไม่ใช้ LLM จริง: ใช้เอเจนต์ตัวอย่างที่โมเดลเป็นของปลอม จึงได้เหตุการณ์ชุดเดิมทุกครั้ง)
// streamEvents v3: กราฟปล่อย "เหตุการณ์" ออกมาเป็นช่อง (method) เช่น tasks (node เริ่ม/จบ), tools (tool เริ่ม/จบ), messages (token), lifecycle (เริ่ม/จบ/ล้ม) แต่ละเหตุการณ์มี params.namespace บอกว่ามาจากกราฟหลัก (ว่าง) หรือกราฟย่อย

// เหตุการณ์ทั้งหมดที่อยู่ในช่อง (method) ที่ระบุ ตามลำดับเดิม
function onChannel(events: ProtocolEvent[], method: string): ProtocolEvent[] {
  // 👉 ข้อ 1 คืนเฉพาะเหตุการณ์ที่ ev.method === method
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   return events.filter((ev) => ev.method === method);
  return todo(1);
}

// ชื่อ node ที่ "เริ่มทำงาน" ตามลำดับ: เหตุการณ์ช่อง tasks ของกราฟหลัก (namespace ว่าง)
// ที่ data มีคีย์ "input" (ตอนจบงานจะมี "result" แทน) คืนค่า data.name
function startedNodes(events: ProtocolEvent[]): string[] {
  return events
    .filter((ev) => ev.method === "tasks" && ev.params.namespace.length === 0)
    .map((ev) => ev.params.data as { name: string; input?: unknown })
    .filter((data) => "input" in data)
    .map((data) => data.name);
}

interface ToolRun {
  id: string;
  name: string;
  output: string;
}

// tool ที่ทำเสร็จแล้ว: จับคู่ tool-started (มีชื่อ) กับ tool-finished (มีผลลัพธ์) ด้วย tool_call_id
function finishedTools(events: ProtocolEvent[]): ToolRun[] {
  const names = new Map<string, string>();
  const runs: ToolRun[] = [];
  for (const ev of onChannel(events, "tools")) {
    const data = ev.params.data as { event: string; tool_call_id: string; tool_name?: string; output?: { content: unknown } };
    if (data.event === "tool-started") names.set(data.tool_call_id, data.tool_name ?? "?");
    if (data.event === "tool-finished") {
      const content = data.output?.content;
      runs.push({ id: data.tool_call_id, name: names.get(data.tool_call_id) ?? "?", output: typeof content === "string" ? content : JSON.stringify(content) });
    }
  }
  return runs;
}

const events = await recordDemoEvents();
console.log("ช่องที่เจอ:", [...new Set(events.map((ev) => ev.method))]);
console.log("node ที่เริ่ม:", startedNodes(events));
console.log("tool ที่เสร็จ:", finishedTools(events));












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const fake = (method: string, data: unknown, namespace: string[] = []): ProtocolEvent =>
  ({ type: "event", seq: 0, method, params: { namespace, timestamp: 0, data } }) as ProtocolEvent;
const lifecycle = onChannel(events, "lifecycle");
const seqs = lifecycle.map((ev) => ev.seq);
const tools = finishedTools(events);
const mixed = startedNodes([
  fake("tasks", { name: "a", input: {} }),
  fake("tasks", { name: "a", result: {} }),
  fake("tasks", { name: "sub", input: {} }, ["sub:1"]),
  fake("updates", { node: "a", values: {} }),
  fake("tasks", { name: "b", input: {} }),
]);
const paired = finishedTools([
  fake("tools", { event: "tool-started", tool_call_id: "1", tool_name: "ก", input: "{}" }),
  fake("tools", { event: "tool-started", tool_call_id: "2", tool_name: "ข", input: "{}" }),
  fake("tools", { event: "tool-finished", tool_call_id: "2", output: { content: "ผลของข" } }),
  fake("tools", { event: "tool-started", tool_call_id: "3", tool_name: "ค", input: "{}" }),
]);
const json = finishedTools([
  fake("tools", { event: "tool-started", tool_call_id: "1", tool_name: "ก", input: "{}" }),
  fake("tools", { event: "tool-finished", tool_call_id: "1", output: { content: [{ type: "text", text: "x" }] } }),
]);

check("onChannel: กรองตามช่องและคงลำดับ", lifecycle.length > 0 && lifecycle.every((ev) => ev.method === "lifecycle") && JSON.stringify(seqs) === JSON.stringify([...seqs].sort((a, b) => a - b)) && onChannel(events, "ไม่มีช่องนี้").length === 0);
check("startedNodes (เอเจนต์จริง): model_request → tools → model_request", JSON.stringify(startedNodes(events)) === '["model_request","tools","model_request"]');
check("startedNodes: ไม่นับตอนจบงาน และไม่นับงานใน namespace ย่อย", JSON.stringify(mixed) === '["a","b"]', "กรอง namespace.length === 0 และ \"input\" in data");
check("finishedTools (เอเจนต์จริง): ชื่อ tool และผลลัพธ์", tools.length === 1 && tools[0].id === "call_1_0" && tools[0].name === "add" && tools[0].output === "3");
check("finishedTools: tool ที่เริ่มแต่ยังไม่จบไม่ถูกนับ และจับคู่ด้วย id แม้สลับลำดับ", JSON.stringify(paired) === JSON.stringify([{ id: "2", name: "ข", output: "ผลของข" }]));
check("finishedTools: เนื้อหาที่ไม่ใช่ข้อความถูกแปลงเป็น JSON", json[0]?.output === '[{"type":"text","text":"x"}]');
