import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-20
// ให้มนุษย์ "ตรวจและแก้" ผลของ LLM ก่อนใช้จริง: LLM ร่างอีเมล -> หยุดรอคน -> คนแก้ (หรือกดใช้ตามร่าง) -> ได้ฉบับสุดท้าย
const State = new StateSchema({
  topic: z.string().default(""),
  draft: z.string().default(""),
  final: z.string().default(""),
});

const graph = new StateGraph(State)
  .addNode("write", async (state) => ({
    draft: (await llm.invoke(`ร่างอีเมลสั้น ๆ เรื่อง ${state.topic}`)).text,
  }))
  .addNode("review", (state) => {
    // ข้อ 1: เรียก interrupt({ draft: state.draft }) ได้ค่า edited กลับมา
    //        ถ้า edited เป็นสตริงที่ไม่ว่าง ใช้เป็น final ไม่เช่นนั้นใช้ state.draft เป็น final
    const edited = interrupt({ draft: state.draft });
    return { final: typeof edited === "string" && edited ? edited : state.draft };
  })
  .addEdge(START, "write")
  .addEdge("write", "review")
  .addEdge("review", END)
  .compile({ checkpointer: new MemorySaver() });

// เริ่มงานสองรอบ (สอง thread): รอบ a คนแก้ร่าง รอบ b กดใช้ตามร่าง
const pendingDraft = async (config: { configurable: { thread_id: string } }) => {
  const r = (await graph.invoke({ topic: "นัดประชุมวันจันทร์" }, config)) as { __interrupt__?: { value: { draft: string } }[] };
  return r.__interrupt__![0].value.draft;
};
const a = { configurable: { thread_id: "a" } };
const b = { configurable: { thread_id: "b" } };
const draftA = await pendingDraft(a);
const draftB = await pendingDraft(b);
console.log("ร่างที่รอตรวจ:", draftA.slice(0, 80));

const edited = "เรียนทุกท่าน ขอเลื่อนประชุมเป็นวันอังคาร";
// ข้อ 2: ส่งฉบับที่แก้แล้ว: resume ด้วย new Command({ resume: edited }) และ config a ได้ state สุดท้าย
const resultA = await graph.invoke(new Command({ resume: edited }), a);

// ข้อ 3: กด "ใช้ตามร่าง": resume ด้วยสตริงว่าง "" และ config b ได้ state สุดท้าย
const resultB = await graph.invoke(new Command({ resume: "" }), b);
console.log({ finalA: resultA.final, finalB: resultB.final.slice(0, 80) });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("LLM ร่างอีเมลที่ไม่ว่างมาให้ตรวจ", draftA.length > 0 && draftB.length > 0);
check("แก้ร่าง -> ฉบับสุดท้ายคือฉบับที่แก้", resultA.final === edited, "resume ด้วยข้อความที่แก้");
check("ใช้ตามร่าง (สตริงว่าง) -> ฉบับสุดท้ายคือร่างเดิม", resultB.final === draftB, 'resume ด้วย ""');
