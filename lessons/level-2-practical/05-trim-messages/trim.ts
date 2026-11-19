import { HumanMessage, trimMessages } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-05
// ประวัติยิ่งยาว ยิ่งแพงและช้า: ก่อนส่งให้ LLM เราตัดให้เหลือแค่ข้อความล่าสุด (ส่วน State ยังเก็บครบทุกข้อความ)
const State = new StateSchema({ messages: MessagesValue });
const KEEP = 3; // จำนวนข้อความล่าสุดสูงสุดที่ส่งให้ LLM
const seen: string[][] = []; // ไว้ตรวจว่า LLM ได้รับข้อความชนิดไหนบ้างในแต่ละรอบ (ไม่ต้องแก้)

const graph = new StateGraph(State)
  .addNode("chat", async (state) => {
    // 👉 ข้อ 1: ตัด state.messages ด้วย trimMessages (maxTokens: KEEP, strategy: "last",
    //        tokenCounter: (msgs) => msgs.length, startOn: "human") ใช้ await
    const recent = todo(1);
    seen.push(recent.map((m) => m.type));
    // 👉 ข้อ 2: ส่ง recent (ไม่ใช่ state.messages) ให้ llm.invoke แล้วคืนคำตอบเข้า messages
    // แนวทาง: return { messages: [await llm.invoke(recent)] };
    return todo(2);
  })
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "t" } };
let result;
for (const text of ["ฉันชื่อมาลี", "ฉันชอบแมว", "ฉันอยู่เชียงใหม่", "ฉันชื่ออะไร"]) {
  result = await graph.invoke({ messages: [new HumanMessage(text)] }, config);
}
console.log("ข้อความที่ LLM เห็นในแต่ละรอบ:", seen.map((s) => s.length));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check(`ทุกรอบ LLM เห็นไม่เกิน ${KEEP} ข้อความ`, seen.every((s) => s.length <= KEEP), "ส่ง recent ที่ตัดแล้วให้ llm");
check("ข้อความที่ LLM เห็นขึ้นต้นด้วยข้อความผู้ใช้เสมอ", seen.every((s) => s[0] === "human"), 'ใส่ startOn: "human"');
check("State ยังเก็บครบทุกข้อความ (8 ข้อความ ไม่ถูกตัด)", result!.messages.length === 8, "ตัดเฉพาะที่ส่งให้ LLM ไม่ใช่ที่เก็บใน State");
