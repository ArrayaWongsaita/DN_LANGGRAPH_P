import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-18
// orchestrator-worker: LLM "วางแผน" แตกเป้าหมายเป็นงานย่อย (จำนวนไม่รู้ล่วงหน้า) ส่งให้ worker ทำพร้อมกัน (Send) แล้วรวมเป็นรายงาน
const State = new StateSchema({
  goal: z.string().default(""),
  tasks: z.array(z.string()).default(() => []),
  results: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
  report: z.string().default(""),
});

const MAX_TASKS = 3;

const graph = new StateGraph(State)
  .addNode("plan", async (state) => {
    // 👉 ข้อ 1: ใช้ llm.withStructuredOutput(z.object({ tasks: z.array(z.string()) }), { method: "functionCalling" }) เรียก invoke ด้วย
    //        `แตกเป้าหมายนี้เป็นงานย่อยสั้น ๆ: ${state.goal}` แล้วคืน { tasks: ผล.tasks.slice(0, MAX_TASKS) }
    return todo(1);
  })
  .addNode("worker", async (input: unknown) => {
    const { task } = input as { task: string };
    return { results: (await llm.invoke(`ทำงานย่อยนี้ ตอบสั้น ๆ: ${task}`)).text };
  })
  .addNode("synthesize", async (state) => {
    // 👉 ข้อ 3: เรียก llm.invoke(`รวมผลต่อไปนี้เป็นรายงานสั้น ๆ: ${state.results.join("; ")}`) แล้วคืน { report: .text }
    return todo(3);
  })
  .addEdge(START, "plan")
  .addConditionalEdges(
    "plan",
    (state) => {
      // 👉 ข้อ 2: คืนรายการ Send ต่อหนึ่ง task: new Send("worker", { task })
      return todo(2);
    },
    ["worker"],
  )
  .addEdge("worker", "synthesize")
  .addEdge("synthesize", END)
  .compile();

const result = await graph.invoke({ goal: "จัดงานเลี้ยงวันเกิดเล็ก ๆ ที่บ้าน" });
console.log("งานย่อย:", result.tasks);
console.log("รายงาน:", result.report);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check(`แผนมีงานย่อย 1-${MAX_TASKS} ข้อ`, result.tasks.length >= 1 && result.tasks.length <= MAX_TASKS, "plan ต้องคืน { tasks } และจำกัดจำนวน");
check("worker ทำงานครบทุกงานย่อย", result.results.length === result.tasks.length, "ส่ง Send หนึ่งอันต่อหนึ่ง task");
check("ได้รายงานรวมที่ไม่ว่าง", result.report.length > 0, "synthesize ต้องคืน { report }");
