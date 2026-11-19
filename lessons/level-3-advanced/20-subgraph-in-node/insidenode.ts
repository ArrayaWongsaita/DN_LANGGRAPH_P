import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-20  (ไม่ใช้ LLM)
// subgraph ที่ State ต่างจากแม่: เรียกจากใน node ของแม่ แล้วแปลงข้อมูลเข้า-ออกเอง

// subgraph: นับคำ (State ของมันคือ text / wc)
const CounterState = new StateSchema({ text: z.string().default(""), wc: z.number().default(0) });
const counter = new StateGraph(CounterState)
  .addNode("count", (s) => ({ wc: s.text.split(" ").length }))
  .addEdge(START, "count")
  .addEdge("count", END)
  .compile();

// graph แม่: State คนละหน้าตา (doc / count)
const ParentState = new StateSchema({ doc: z.string().default(""), count: z.number().default(0) });

const parent = new StateGraph(ParentState)
  .addNode("callCounter", async (state) => {
    // 👉 ข้อ 1: เรียก counter.invoke({ text: state.doc }) แล้วคืน { count: ผล.wc } (แปลงชื่อ field เอง)
    return todo(1);
  })
  .addEdge(START, "callCounter")
  .addEdge("callCounter", END)
  .compile();

const a = await parent.invoke({ doc: "one two three four" });
const b = await parent.invoke({ doc: "hello" });
console.log({ a: a.count, b: b.count });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("นับคำของเอกสารยาว = 4", a.count === 4, "เรียก counter.invoke({ text: state.doc })");
check("นับคำของเอกสารสั้น = 1", b.count === 1);
