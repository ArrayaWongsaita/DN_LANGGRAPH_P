import { tool } from "@langchain/core/tools";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { z } from "zod";
import { buildPlanner, buildSelectiveAgent, buildTestAgent, renderTodos, toolsToEmulate } from "./agents";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้) ใช้ createAgent และ middleware จริงกับโมเดลปลอม
const runs: Record<string, number> = {};
const mk = (name: string, description: string) =>
  tool(
    async () => {
      runs[name] = (runs[name] ?? 0) + 1;
      return `${name}-จริง`;
    },
    { name, description, schema: z.object({ q: z.string().optional() }) },
  );
const tools = () => [mk("add", "บวกเลข"), mk("weather", "สภาพอากาศ"), mk("email", "ส่งอีเมล"), mk("search", "ค้นเว็บ")];
const ask = (text: string) => ({ messages: [{ role: "user" as const, content: text }] });
beforeEach(() => {
  for (const k of Object.keys(runs)) delete runs[k];
});

test("tool selector: โมเดลหลักเห็นเฉพาะ tool ที่คัดเลือก + alwaysInclude", async () => {
  const main = fakeToolLLM(["ตอบ"]);
  const selector = fakeToolLLM([JSON.stringify({ tools: ["weather"] })]);
  await buildSelectiveAgent(main, selector, tools()).invoke(ask("อากาศวันนี้"));
  expect(main.boundToolNames.sort()).toEqual(["search", "weather"]);
  expect(selector.calls).toHaveLength(1); // ตัวคัดเลือกถูกเรียกหนึ่งครั้ง (ราคาที่ต้องจ่าย)
});

test("tool selector: maxTools = 2 ตัดส่วนเกิน (alwaysInclude ไม่นับ)", async () => {
  const main = fakeToolLLM(["ตอบ"]);
  const selector = fakeToolLLM([JSON.stringify({ tools: ["add", "weather", "email"] })]);
  await buildSelectiveAgent(main, selector, tools()).invoke(ask("ทำหลายอย่าง"));
  expect(main.boundToolNames.sort()).toEqual(["add", "search", "weather"]);
});

test("tool selector: ตัวคัดเลือกเห็นคำถามของผู้ใช้", async () => {
  const main = fakeToolLLM(["ตอบ"]);
  const selector = fakeToolLLM([JSON.stringify({ tools: ["add"] })]);
  await buildSelectiveAgent(main, selector, tools()).invoke(ask("บวก 1 กับ 2"));
  expect(selector.calls[0].map((m) => String(m.content)).join(" ")).toContain("บวก 1 กับ 2");
});

test("to-do list: มี tool write_todos และ state.todos ถูกอัปเดต", async () => {
  const main = fakeToolLLM([
    { toolCalls: [{ name: "write_todos", args: { todos: [{ content: "ค้นข้อมูล", status: "in_progress" }, { content: "สรุป", status: "pending" }] } }] },
    "วางแผนแล้ว",
  ]);
  const r = (await buildPlanner(main).invoke(ask("ทำรายงาน"))) as { todos?: { content: string; status: string }[] };
  expect(main.boundToolNames).toContain("write_todos");
  expect(r.todos).toEqual([
    { content: "ค้นข้อมูล", status: "in_progress" },
    { content: "สรุป", status: "pending" },
  ]);
});

test("tool emulator: tool ที่ระบุถูกจำลอง (ของจริงไม่ถูกเรียก) ส่วน tool อื่นรันจริง", async () => {
  const main = fakeToolLLM([
    { toolCalls: [{ name: "email", args: { q: "ส่งหา x" } }, { name: "add", args: { q: "1+1" } }] },
    "เสร็จ",
  ]);
  const emulator = fakeToolLLM(["(จำลอง) ส่งอีเมลแล้ว"]);
  const r = await buildTestAgent(main, emulator, tools(), ["email"]).invoke(ask("ส่งเมลแล้วบวก"));
  expect(runs.email).toBeUndefined(); // ไม่ได้ส่งอีเมลจริง
  expect(runs.add).toBe(1);
  const results = r.messages.filter((m) => m.type === "tool").map((m) => String(m.content));
  expect(results).toContain("(จำลอง) ส่งอีเมลแล้ว");
  expect(results).toContain("add-จริง");
  expect(emulator.calls).toHaveLength(1);
});

test("renderTodos: ป้ายสถานะและลำดับเลข", () => {
  expect(
    renderTodos([
      { content: "ค้นข้อมูล", status: "completed" },
      { content: "เขียนร่าง", status: "in_progress" },
      { content: "ตรวจทาน", status: "pending" },
    ]),
  ).toBe("1. [เสร็จ] ค้นข้อมูล\n2. [กำลังทำ] เขียนร่าง\n3. [รอ] ตรวจทาน");
});

test("renderTodos: ไม่มีแผน", () => {
  expect(renderTodos(undefined)).toBe("(ยังไม่มีแผน)");
  expect(renderTodos([])).toBe("(ยังไม่มีแผน)");
});

test("toolsToEmulate: จำลองทุก tool ที่ไม่ได้รับรองว่าอ่านอย่างเดียว (ปลอดภัยไว้ก่อน)", () => {
  const all = [{ name: "search" }, { name: "email" }, { name: "weather" }, { name: "pay" }];
  expect(toolsToEmulate(all, ["search", "weather"])).toEqual(["email", "pay"]);
  expect(toolsToEmulate(all, [])).toEqual(["search", "email", "weather", "pay"]);
  expect(toolsToEmulate(all, ["search", "email", "weather", "pay"])).toEqual([]);
  expect(toolsToEmulate([{ name: "ใหม่" }], ["ชื่ออื่น"])).toEqual(["ใหม่"]);
});
