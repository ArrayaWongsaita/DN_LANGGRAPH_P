import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-01  (ไม่ใช้ LLM)
// graph มี State ภายใน (Full) ที่มีช่อง "ส่วนตัว" (scratch) แต่ผู้เรียกใช้ควรส่งแค่ In และเห็นแค่ Out
const Full = new StateSchema({
  question: z.string().default(""),
  scratch: z.string().default(""), // ส่วนตัว: ใช้ระหว่าง node เท่านั้น
  answer: z.string().default(""),
});
const In = new StateSchema({ question: z.string() });
const Out = new StateSchema({ answer: z.string() });

// ข้อ 1: ประกอบ StateGraph ด้วย { state: Full, input: In, output: Out }
const builder = new StateGraph({ state: Full, input: In, output: Out });

const graph = builder
  .addNode("think", (state) => {
    // ข้อ 2: คืน { scratch: `คิดเรื่อง: ${state.question}`, answer: `คำตอบของ: ${state.question}` }
    return { scratch: `คิดเรื่อง: ${state.question}`, answer: `คำตอบของ: ${state.question}` };
  })
  .addEdge(START, "think")
  .addEdge("think", END)
  .compile();

const result = await graph.invoke({ question: "ทำไมท้องฟ้าสีฟ้า" });
console.log(result);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ผลลัพธ์มีแค่ field ของ Out (answer)", JSON.stringify(Object.keys(result)) === '["answer"]', "ใส่ output: Out ตอนสร้าง StateGraph");
check("answer มาจาก node think", (result as { answer?: string }).answer === "คำตอบของ: ทำไมท้องฟ้าสีฟ้า");
check("ช่องส่วนตัว scratch ไม่รั่วออกมา", !("scratch" in result));
