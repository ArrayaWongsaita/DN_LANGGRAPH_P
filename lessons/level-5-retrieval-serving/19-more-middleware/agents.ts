import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { tool } from "@langchain/core/tools";
import { createAgent, llmToolSelectorMiddleware, todoListMiddleware, toolEmulatorMiddleware } from "langchain";
import { todo } from "@src/todo";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-19
// middleware สำเร็จรูปสามตัวที่ใช้บ่อย: llmToolSelectorMiddleware (มี tool เยอะ ให้โมเดลเล็กคัดก่อนส่งให้โมเดลหลัก ประหยัดโทเค็นและลดการเลือกผิด), todoListMiddleware (งานยาวให้โมเดลจดแผนเป็น to-do list ใน state), toolEmulatorMiddleware (ตอนทดสอบให้โมเดลจำลองผลของ tool ที่มีผลข้างเคียง เช่นส่งอีเมล แทนที่จะรันจริง)
type AnyTool = StructuredToolInterface;

// agent ที่ให้ตัวคัดเลือกกรอง tool ก่อนส่งให้โมเดลหลัก
function buildSelectiveAgent(model: BaseChatModel, selectorLlm: BaseChatModel, tools: AnyTool[]) {
  // 👉 ข้อ 1: createAgent({ model, tools, middleware: [llmToolSelectorMiddleware({ model: selectorLlm, maxTools: 2, alwaysInclude: ["search"] })] })
  //          (โมเดลคัดเลือกส่งเข้าเป็น model; ต้องแปลงชนิดด้วย `as never` เพราะชนิดของ option เข้มกว่า)
  return todo(1);
}

// agent วางแผนงานยาวด้วย to-do list
function buildPlanner(model: BaseChatModel) {
  // 👉 ข้อ 2: createAgent({ model, tools: [], middleware: [todoListMiddleware()] })
  return todo(2);
}

// agent สำหรับทดสอบ: จำลอง tool ที่ระบุด้วยโมเดล ส่วน tool อื่นรันจริง
function buildTestAgent(model: BaseChatModel, emulatorLlm: BaseChatModel, tools: AnyTool[], emulate: string[]) {
  // 👉 ข้อ 3: createAgent({ model, tools, middleware: [toolEmulatorMiddleware({ tools: emulate, model: emulatorLlm })] })
  //          (ใส่ `as never` ที่ model ของ emulator เช่นเดียวกับข้อ 1)
  return todo(3);
}

interface TodoItem {
  content: string;
  status: "pending" | "in_progress" | "completed";
}

// ข้อความแผนสำหรับ UI: บรรทัดละหนึ่งงาน `${เลขที่เริ่มจาก 1}. [${ป้าย}] ${content}`
// ป้าย: pending → "รอ", in_progress → "กำลังทำ", completed → "เสร็จ"  รายการว่างคืน "(ยังไม่มีแผน)"
function renderTodos(todos: TodoItem[] | undefined): string {
  // 👉 ข้อ 4: สร้างข้อความตามที่อธิบาย (undefined หรือว่าง → "(ยังไม่มีแผน)")
  return todo(4);
}

// ชื่อ tool ที่ควรจำลองตอนทดสอบ = tool ที่ "มีผลข้างเคียง" คือไม่อยู่ใน readOnly (รักษาลำดับเดิมของ tools)
function toolsToEmulate(tools: { name: string }[], readOnly: string[]): string[] {
  // 👉 ข้อ 5: คืนชื่อของ tool ที่ name ไม่อยู่ใน readOnly (ปลอดภัยไว้ก่อน: tool ที่ไม่รู้จักถือว่ามีผลข้างเคียง)
  return todo(5);
}

// tool ปลอมที่จดว่าถูกรันจริงกี่ครั้ง
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

// ส่วนที่ 1: โมเดลปลอมตามสคริปต์
const main1 = fakeToolLLM(["ตอบ"]);
const selector1 = fakeToolLLM([JSON.stringify({ tools: ["weather"] })]);
await buildSelectiveAgent(main1, selector1, tools()).invoke(ask("อากาศวันนี้"));
const main2 = fakeToolLLM(["ตอบ"]);
const selector2 = fakeToolLLM([JSON.stringify({ tools: ["add", "weather", "email"] })]);
await buildSelectiveAgent(main2, selector2, tools()).invoke(ask("ทำหลายอย่าง"));
const main3 = fakeToolLLM(["ตอบ"]);
const selector3 = fakeToolLLM([JSON.stringify({ tools: ["add"] })]);
await buildSelectiveAgent(main3, selector3, tools()).invoke(ask("บวก 1 กับ 2"));
const planMain = fakeToolLLM([
  { toolCalls: [{ name: "write_todos", args: { todos: [{ content: "ค้นข้อมูล", status: "in_progress" }, { content: "สรุป", status: "pending" }] } }] },
  "วางแผนแล้ว",
]);
const planned = (await buildPlanner(planMain).invoke(ask("ทำรายงาน"))) as { todos?: TodoItem[] };
for (const k of Object.keys(runs)) delete runs[k];
const emuMain = fakeToolLLM([{ toolCalls: [{ name: "email", args: { q: "ส่งหา x" } }, { name: "add", args: { q: "1+1" } }] }, "เสร็จ"]);
const emulator = fakeToolLLM(["(จำลอง) ส่งอีเมลแล้ว"]);
const emuOut = await buildTestAgent(emuMain, emulator, tools(), ["email"]).invoke(ask("ส่งเมลแล้วบวก"));
const emuResults = emuOut.messages.filter((m) => m.type === "tool").map((m) => String(m.content));
const emuRuns = { ...runs };

// ส่วนที่ 2: โมเดลจริงวางแผนด้วย to-do list
const real = (await buildPlanner(llm).invoke(ask("ช่วยวางแผนทำเค้กช็อกโกแลตเป็น 3 ขั้นตอน โดยบันทึกแผนด้วย to-do list"))) as { todos?: TodoItem[] };
console.log(renderTodos(real.todos));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const all = [{ name: "search" }, { name: "email" }, { name: "weather" }, { name: "pay" }];
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
check("tool selector: โมเดลหลักเห็นเฉพาะ tool ที่คัดเลือก + alwaysInclude และตัวคัดเลือกถูกเรียกหนึ่งครั้ง", same([...main1.boundToolNames].sort(), ["search", "weather"]) && selector1.calls.length === 1);
check("tool selector: maxTools = 2 ตัดส่วนเกิน (alwaysInclude ไม่นับ)", same([...main2.boundToolNames].sort(), ["add", "search", "weather"]));
check("tool selector: ตัวคัดเลือกเห็นคำถามของผู้ใช้", selector3.calls[0].map((m) => String(m.content)).join(" ").includes("บวก 1 กับ 2"));
check("to-do list: มี tool write_todos และ state.todos ถูกอัปเดต", planMain.boundToolNames.includes("write_todos") && same(planned.todos, [{ content: "ค้นข้อมูล", status: "in_progress" }, { content: "สรุป", status: "pending" }]));
check("tool emulator: tool ที่ระบุถูกจำลอง (ของจริงไม่ถูกเรียก) ส่วน tool อื่นรันจริง", emuRuns.email === undefined && emuRuns.add === 1 && emuResults.includes("(จำลอง) ส่งอีเมลแล้ว") && emuResults.includes("add-จริง") && emulator.calls.length === 1);
check("renderTodos: ป้ายสถานะและลำดับเลข", renderTodos([{ content: "ค้นข้อมูล", status: "completed" }, { content: "เขียนร่าง", status: "in_progress" }, { content: "ตรวจทาน", status: "pending" }]) === "1. [เสร็จ] ค้นข้อมูล\n2. [กำลังทำ] เขียนร่าง\n3. [รอ] ตรวจทาน");
check("renderTodos: ไม่มีแผน", renderTodos(undefined) === "(ยังไม่มีแผน)" && renderTodos([]) === "(ยังไม่มีแผน)");
check("toolsToEmulate: จำลองทุก tool ที่ไม่ได้รับรองว่าอ่านอย่างเดียว (ปลอดภัยไว้ก่อน)", same(toolsToEmulate(all, ["search", "weather"]), ["email", "pay"]) && same(toolsToEmulate(all, []), ["search", "email", "weather", "pay"]) && toolsToEmulate(all, ["search", "email", "weather", "pay"]).length === 0 && same(toolsToEmulate([{ name: "ใหม่" }], ["ชื่ออื่น"]), ["ใหม่"]));
check("toolsToEmulate: เทียบชื่อตรงเป๊ะ (ชื่อที่ขึ้นต้นเหมือนกันยังถูกจำลอง)", same(toolsToEmulate([{ name: "search_delete" }, { name: "search" }], ["search"]), ["search_delete"]));
check("โมเดลจริง: จดแผนด้วย write_todos ได้อย่างน้อย 1 งาน", Array.isArray(real.todos) && real.todos.length >= 1, "ตรวจโมเดลใน 1-02 ว่ารองรับ tool calling");
