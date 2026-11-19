import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-03
// thread_id = "ห้องแชต": ห้องเดียวกันจำประวัติร่วมกัน คนละห้องแยกกันเด็ดขาด
const State = new StateSchema({ messages: MessagesValue });

const graph = new StateGraph(State)
  .addNode("chat", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile({ checkpointer: new MemorySaver() });

// ลำดับคำพูด: (ผู้ใช้, หัวข้อ, ข้อความ)
const turns = [
  ["mali", "งาน", "ฉันชื่อมาลี"],
  ["somchai", "งาน", "ฉันชื่ออะไร"],
  ["mali", "งาน", "ฉันชื่ออะไร"],
];

const replies: string[] = [];
for (const [user, topic, text] of turns) {
  // ข้อ 1: ประกอบรหัสห้องจากผู้ใช้และหัวข้อ เช่น user = "mali", topic = "งาน" ได้ "mali:งาน"
  const threadId: string = `${user}:${topic}`;

  // ข้อ 2: invoke ด้วย { messages: [new HumanMessage(text)] } และ config ที่ระบุ thread_id ของห้องนี้
  const result = await graph.invoke({ messages: [new HumanMessage(text)] }, { configurable: { thread_id: threadId } });
  replies.push(result.messages[result.messages.length - 1].text);
}

const count = async (id: string) => (await graph.getState({ configurable: { thread_id: id } })).values.messages?.length ?? 0;
console.log("สมชายถามชื่อ (ห้องของเขาไม่มีประวัติ):", replies[1]);
console.log("มาลีถามชื่อ (ห้องของเธอมีประวัติ):", replies[2]);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ห้อง mali:งาน เก็บ 4 ข้อความ (สองรอบ)", (await count("mali:งาน")) === 4, "รหัสห้องต้องเป็น `${user}:${topic}` และส่งผ่าน config");
check("ห้อง somchai:งาน เก็บแค่ 2 ข้อความ (แยกจากห้องมาลี)", (await count("somchai:งาน")) === 2);
check("มาลีถามชื่อในห้องเดิม LLM จำ 'มาลี' ได้", replies[2].includes("มาลี"));
