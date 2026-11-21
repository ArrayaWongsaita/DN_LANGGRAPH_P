// รันด้วย pnpm lesson 2-04
// บทนี้เรียนคำสั่ง graph.updateState: แก้ State ของ thread จากนอก graph (ใช้ได้โดยไม่ต้องมี API key)
import { AIMessage, HumanMessage, RemoveMessage, type BaseMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { check } from "@src/check";

// graph แชตง่าย ๆ ที่มีความจำ: ทุกรอบตอบ "รับทราบ" (ให้มาแล้ว ไม่ต้องแก้)
const State = new StateSchema({ messages: MessagesValue });

const graph = new StateGraph(State)
  .addNode("chat", () => ({ messages: [new AIMessage("รับทราบ")] }))
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "mali" } };

// คุยไป 2 รอบ ข้อความผู้ใช้มี id: h1 = "ฉันชอบแมว", h2 = "ฉันชอบสุนัข" (รวม 4 ข้อความ)
await graph.invoke({ messages: [new HumanMessage({ id: "h1", content: "ฉันชอบแมว" })] }, config);
await graph.invoke({ messages: [new HumanMessage({ id: "h2", content: "ฉันชอบสุนัข" })] }, config);

// อ่าน State: getState คืน snapshot ข้อความอยู่ที่ .values.messages (?? [] กันกรณี thread ว่าง)
const before: BaseMessage[] = (await graph.getState(config)).values.messages ?? [];

await graph.updateState(config, {
  messages: [new RemoveMessage({ id: "h1" })],
});

const after: BaseMessage[] = (await graph.getState(config)).values.messages ?? [];

console.log("ก่อนลบ", before.map((message) => message.text));
console.log("หลังลบ", after.map((message) => message.text));












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ลบเฉพาะข้อความ h1", before.length === 4 && after.length === 3 && after.every((m) => m.id !== "h1") && after.some((m) => m.id === "h2"), 'ส่ง RemoveMessage ที่มี id "h1" ผ่าน updateState');
