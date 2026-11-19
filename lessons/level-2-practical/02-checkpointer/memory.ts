import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-02
// checkpointer = ที่เก็บ State หลังจบแต่ละรอบ ทำให้ graph "จำ" บทสนทนาข้ามการเรียก invoke
const State = new StateSchema({ messages: MessagesValue });

const builder = new StateGraph(State)
  .addNode("chat", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
  .addEdge(START, "chat")
  .addEdge("chat", END);

// 👉 ข้อ 1: compile พร้อม checkpointer แบบ MemorySaver (เก็บความจำไว้ใน RAM)
// แนวทาง: builder.compile({ checkpointer: new MemorySaver() })
const graph: ReturnType<typeof builder.compile> = todo(1);

// thread_id ยังเป็นค่าคงที่ (บท 2-03 จะสอนการใช้หลาย thread)
const config = { configurable: { thread_id: "default" } };

const replies: string[] = [];
for (const text of ["ฉันชื่อมาลี", "ฉันชื่ออะไร"]) {
  const result = await graph.invoke({ messages: [new HumanMessage(text)] }, config);
  replies.push(result.messages[result.messages.length - 1].text);
}
const state = await graph.getState(config);
console.log("คำตอบรอบสอง:", replies[1]);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("หลังสองรอบมีข้อความสะสม 4 ข้อความ (ผู้ใช้ AI ผู้ใช้ AI)", state.values.messages?.length === 4, "ต้อง compile พร้อม checkpointer");
check("รอบสอง LLM จำชื่อ 'มาลี' ได้", replies[1].includes("มาลี"), "ถ้าไม่ผ่าน ดูว่าส่ง config เดิม (thread_id เดิม) ทั้งสองรอบ");
