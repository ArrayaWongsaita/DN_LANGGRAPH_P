import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { check } from "@src/check";

const llm = fakeToolLLM([
  "LangGraph ใช้ต่อขั้นตอนที่อ่านและอัปเดต State ร่วมกัน",
  "node คือขั้นตอนที่อ่าน State และคืนค่าอัปเดต",
]);
const State = new StateSchema({
  question: z.string(),
  answer: z.string().default(""),
});

async function ask(state: typeof State.State): Promise<{ answer: string }> {
  const reply = await llm.invoke(state.question);
  return { answer: reply.text };
}

const app = new StateGraph(State)
  .addNode("ask", ask)
  .addEdge(START, "ask")
  .addEdge("ask", END)
  .compile();

const question = "LangGraph ใช้ทำอะไร";
const result = await app.invoke({ question });
console.log(result);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("node ส่งคำถามจาก State ให้โมเดลหนึ่งครั้ง", llm.calls.length === 1 && llm.calls[0]?.[0]?.text === question, "ส่ง state.question ให้ llm.invoke()");
check("คำตอบจากโมเดลอยู่ใน State", result.answer === "LangGraph ใช้ต่อขั้นตอนที่อ่านและอัปเดต State ร่วมกัน", "รอผลด้วย await แล้วคืน { answer: reply.text }");
check("State ยังเก็บคำถามเดิม", result.question === question);
const nextQuestion = "node คืออะไร";
const nextResult = await app.invoke({ question: nextQuestion });
check("เมื่อเปลี่ยนคำถาม node ส่งคำถามใหม่และเก็บคำตอบรอบใหม่", llm.calls[1]?.[0]?.text === nextQuestion && nextResult.answer === "node คือขั้นตอนที่อ่าน State และคืนค่าอัปเดต");
