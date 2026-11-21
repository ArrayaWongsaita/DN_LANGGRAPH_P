import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-34
// โปรเจกต์ปิดบทกลาง: ผู้ช่วยวิจัย = วางแผน (plan) -> ค้นคว้าพร้อมกัน (Send) -> เขียนรายงาน -> ตรวจ -> วนแก้จนผ่านหรือครบรอบ
// บทนี้รวมของที่เรียนมา: structured output, Send/fan-out (3-03, 3-18), evaluator-optimizer (3-19), conditional edge
const MAX_TOPICS = 3;
const MAX_ROUNDS = 2;

const State = new StateSchema({
  question: z.string().default(""),
  topics: z.array(z.string()).default(() => []),
  notes: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
  report: z.string().default(""),
  feedback: z.string().default(""),
  approved: z.boolean().default(false),
  round: z.number().default(0),
});

const graph = new StateGraph(State)
  .addNode("plan", async (state) => {
    // 👉 ข้อ 1 ใช้ llm.withStructuredOutput(z.object({ topics: z.array(z.string()) }), { method: "functionCalling" }) invoke ด้วย
    //        `แตกคำถามเป็นหัวข้อย่อยสั้น ๆ: ${state.question}` แล้วคืน { topics: ผล.topics.slice(0, MAX_TOPICS) }
    // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
    //   const structured = llm.withStructuredOutput(z.object({ topics: z.array(z.string()) }), { method: "functionCalling" });
    //   const out = await structured.invoke(`แตกคำถามเป็นหัวข้อย่อยสั้น ๆ: ${state.question}`);
    //   return { topics: out.topics.slice(0, MAX_TOPICS) };
    return todo(1);
  })
  .addNode("researchTask", async (input: unknown) => {
    const { topic } = input as { topic: string };
    return { notes: (await llm.invoke(`ค้นคว้าหัวข้อนี้ ตอบสั้น ๆ: ${topic}`)).text };
  })
  .addNode("write", async (state) => {
    const prompt =
      `เขียนรายงานสั้น ๆ ตอบ "${state.question}" จากโน้ต: ${state.notes.join("; ")}` +
      (state.feedback ? `\nแก้ตามข้อติ: ${state.feedback}` : "");
    const reply = await llm.invoke(prompt);
    return { report: reply.text, round: state.round + 1 };
  })
  .addNode("review", async (state) => {
    const verdict = await llm
      .withStructuredOutput(z.object({ approved: z.boolean(), feedback: z.string() }), { method: "functionCalling" })
      .invoke(`ตรวจรายงานนี้ว่าตอบคำถามครบหรือไม่: ${state.report}`);
    return { approved: verdict.approved, feedback: verdict.feedback };
  })
  .addEdge(START, "plan")
  .addConditionalEdges(
    "plan",
    (state) => {
      // 👉 ข้อ 2 คืนรายการ Send หนึ่งอันต่อหนึ่งหัวข้อ: new Send("researchTask", { topic })
      // แนวทาง (เอา // ออกแล้วแทนที่ todo(2) ได้เลย):
      //   return state.topics.map((topic) => new Send("researchTask", { topic }));
      return todo(2);
    },
    ["researchTask"],
  )
  .addEdge("researchTask", "write")
  .addEdge("write", "review")
  .addConditionalEdges(
    "review",
    (state) => {
      // 👉 ข้อ 3 คืน END ถ้า state.approved หรือ state.round >= MAX_ROUNDS ไม่เช่นนั้นคืน "write"
      // แนวทาง (เอา // ออกแล้วแทนที่ todo(3) ได้เลย):
      //   return state.approved || state.round >= MAX_ROUNDS ? END : "write";
      return todo(3);
    },
    ["write", END],
  )
  .compile();

const result = await graph.invoke({ question: "ทำไมการนอนหลับเพียงพอจึงสำคัญต่อสุขภาพ" });
console.log("หัวข้อ:", result.topics);
console.log(`วน ${result.round} รอบ อนุมัติ=${result.approved}\n${result.report}`);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check(`แผนมีหัวข้อ 1-${MAX_TOPICS} ข้อ`, result.topics.length >= 1 && result.topics.length <= MAX_TOPICS, "plan ต้องคืน { topics } และจำกัดจำนวน");
check("ค้นคว้าครบทุกหัวข้อ (โน้ตเท่ากับหัวข้อ)", result.notes.length === result.topics.length, "Send หนึ่งอันต่อหนึ่งหัวข้อ");
check("ได้รายงานที่ไม่ว่าง", result.report.length > 0);
check(`วนเขียน-ตรวจไม่เกิน ${MAX_ROUNDS} รอบ และจบเพราะอนุมัติหรือครบรอบ`, result.round >= 1 && result.round <= MAX_ROUNDS && (result.approved || result.round === MAX_ROUNDS), "เงื่อนไขวนกลับไป write");
