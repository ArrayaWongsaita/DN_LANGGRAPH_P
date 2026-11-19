import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-04  (ไม่ใช้ LLM)
// interrupt() รับคำตอบจากคน: ใส่ schema กำกับ เพื่อให้คำตอบผิดรูปแบบถูกปฏิเสธ แทนที่จะผ่านเข้า graph เงียบ ๆ
const Decision = z.object({ approved: z.boolean(), note: z.string().default("") });
const State = new StateSchema({ result: z.string().default("") });

const app = new StateGraph(State)
  .addNode("decide", () => {
    // ข้อ 1: const answer = interrupt({ question: "อนุมัติไหม?" }, { responseSchema: Decision });
    //          แล้วคืน { result: JSON.stringify(answer) }
    const answer = interrupt({ question: "อนุมัติไหม?" }, { responseSchema: Decision });
    return { result: JSON.stringify(answer) };
  })
  .addEdge(START, "decide")
  .addEdge("decide", END)
  .compile({ checkpointer: new MemorySaver() });

const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

// thread t: เริ่ม แล้วตอบผิดรูปแบบก่อน (approved เป็นข้อความ) ต้องถูกปฏิเสธ
await app.invoke({}, cfg("t"));
let rejected = "";
try {
  await app.invoke(new Command({ resume: { approved: "yes" } }), cfg("t"));
} catch (e) {
  rejected = (e as Error).message;
}

// ข้อ 2: thread t ยังรออยู่: ตอบใหม่ให้ถูกรูปแบบด้วย new Command({ resume: { approved: false, note: "ไม่ครบ" } }) และ cfg("t") ได้ state สุดท้าย
const retried = await app.invoke(new Command({ resume: { approved: false, note: "ไม่ครบ" } }), cfg("t"));

// thread u: ตอบถูกรูปแบบตั้งแต่แรก แต่ไม่ใส่ note: schema เติมค่า default ให้ (ให้มาแล้ว)
await app.invoke({}, cfg("u"));
const filled = await app.invoke(new Command({ resume: { approved: true } }), cfg("u"));
console.log({ rejected: rejected.slice(0, 60), retried: retried.result, filled: filled.result });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("คำตอบผิดรูปแบบถูกปฏิเสธ ไม่ใช่ผ่านเงียบ ๆ", rejected.length > 0, "ใส่ { responseSchema: Decision } ให้ interrupt");
check("ตอบผิดแล้วตอบใหม่ให้ถูก: thread ยังรออยู่และทำต่อได้", retried.result === JSON.stringify({ approved: false, note: "ไม่ครบ" }), "resume ซ้ำด้วย config เดิม");
check("คำตอบถูกรูปแบบ: ผ่าน และเติม default ให้ (note เป็นสตริงว่าง)", filled.result === JSON.stringify({ approved: true, note: "" }));
