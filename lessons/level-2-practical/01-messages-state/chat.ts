import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-01
// แชตบอตต้องจำว่าคุยอะไรกันไปแล้ว: ที่เก็บคือ State ที่มี field messages (MessagesValue = reducer สำเร็จรูปสำหรับแชต)
const State = new StateSchema({ messages: MessagesValue });

const graph = new StateGraph(State)
  .addNode("chat", async (state) => {
    const reply = await llm.invoke(state.messages);
    // 👉 ข้อ 1: คืน update ที่ต่อ reply ท้าย messages (reducer จะต่อท้ายให้เอง ไม่ทับของเดิม)
    // แนวทาง: return { messages: [reply] };
    return todo(1);
  })
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile();

// ถามสองรอบด้วย graph เดิม (ยังไม่มี checkpointer = ไม่มีความจำข้ามการเรียก invoke)
const first = await graph.invoke({ messages: [new HumanMessage("ฉันชื่อมาลี")] });
const second = await graph.invoke({ messages: [new HumanMessage("ฉันชื่ออะไร")] });

// 👉 ข้อ 2: เอา "ข้อความตอบกลับล่าสุด" (ข้อความสุดท้ายใน second.messages) เป็นสตริง
// แนวทาง: second.messages[second.messages.length - 1].text
const lastReply: string = todo(2);

console.log("รอบแรก:", first.messages.map((m) => `${m.type}: ${m.text}`));
console.log("รอบสอง:", lastReply);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("รอบแรกมีข้อความผู้ใช้ตามด้วยคำตอบของ AI", first.messages.map((m) => m.type).join(",") === "human,ai", "node ต้องคืน { messages: [reply] }");
check("ได้ข้อความตอบกลับเป็นสตริงที่ไม่ว่าง", typeof lastReply === "string" && lastReply.length > 0, "ดู .text ของข้อความสุดท้าย");
check("ไม่มี checkpointer: รอบสองมีแค่ 2 ข้อความ (ไม่เห็นรอบแรก)", second.messages.length === 2, "บทหน้าจะเพิ่มความจำให้");
