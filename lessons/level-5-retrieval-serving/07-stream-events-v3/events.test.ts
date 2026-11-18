import type { ProtocolEvent } from "@langchain/langgraph";
import { recordDemoEvents } from "@src/streamDemo";
import { finishedTools, onChannel, startedNodes } from "./events";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ป้อนเหตุการณ์จริงจากเอเจนต์ตัวอย่าง (โมเดลปลอม ไม่ใช้เครือข่าย)
const fake = (method: string, data: unknown, namespace: string[] = []): ProtocolEvent =>
  ({ type: "event", seq: 0, method, params: { namespace, timestamp: 0, data } }) as ProtocolEvent;

test("onChannel: กรองตามช่องและคงลำดับ", async () => {
  const events = await recordDemoEvents();
  const lifecycle = onChannel(events, "lifecycle");
  expect(lifecycle.length).toBeGreaterThan(0);
  expect(lifecycle.every((ev) => ev.method === "lifecycle")).toBe(true);
  expect(lifecycle.map((ev) => ev.seq)).toEqual([...lifecycle.map((ev) => ev.seq)].sort((a, b) => a - b));
  expect(onChannel(events, "ไม่มีช่องนี้")).toEqual([]);
});

test("startedNodes (เอเจนต์จริง): model_request → tools → model_request", async () => {
  expect(startedNodes(await recordDemoEvents())).toEqual(["model_request", "tools", "model_request"]);
});

test("startedNodes: ไม่นับตอนจบงาน และไม่นับงานใน namespace ย่อย", () => {
  const events = [
    fake("tasks", { name: "a", input: {} }),
    fake("tasks", { name: "a", result: {} }),
    fake("tasks", { name: "sub", input: {} }, ["sub:1"]),
    fake("updates", { node: "a", values: {} }),
    fake("tasks", { name: "b", input: {} }),
  ];
  expect(startedNodes(events)).toEqual(["a", "b"]);
});

test("finishedTools (เอเจนต์จริง): ชื่อ tool และผลลัพธ์", async () => {
  const tools = finishedTools(await recordDemoEvents());
  expect(tools).toHaveLength(1);
  expect(tools[0]).toMatchObject({ id: "call_1_0", name: "add", output: "3" });
});

test("finishedTools: tool ที่เริ่มแต่ยังไม่จบไม่ถูกนับ และจับคู่ด้วย id แม้สลับลำดับ", () => {
  const events = [
    fake("tools", { event: "tool-started", tool_call_id: "1", tool_name: "ก", input: "{}" }),
    fake("tools", { event: "tool-started", tool_call_id: "2", tool_name: "ข", input: "{}" }),
    fake("tools", { event: "tool-finished", tool_call_id: "2", output: { content: "ผลของข" } }),
    fake("tools", { event: "tool-started", tool_call_id: "3", tool_name: "ค", input: "{}" }),
  ];
  expect(finishedTools(events)).toEqual([{ id: "2", name: "ข", output: "ผลของข" }]);
});

test("finishedTools: เนื้อหาที่ไม่ใช่ข้อความถูกแปลงเป็น JSON", () => {
  const events = [
    fake("tools", { event: "tool-started", tool_call_id: "1", tool_name: "ก", input: "{}" }),
    fake("tools", { event: "tool-finished", tool_call_id: "1", output: { content: [{ type: "text", text: "x" }] } }),
  ];
  expect(finishedTools(events)[0].output).toBe('[{"type":"text","text":"x"}]');
});
