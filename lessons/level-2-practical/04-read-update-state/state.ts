import { AIMessage, HumanMessage, RemoveMessage, type BaseMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { check } from "@src/check";
import { todo } from "@src/todo";

const State = new StateSchema({ messages: MessagesValue });

const graph = new StateGraph(State)
  .addNode("chat", () => ({ messages: [new AIMessage("รับทราบ")] }))
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "mali" } };

await graph.invoke({ messages: [new HumanMessage({ id: "h1", content: "ฉันชอบแมว" })] }, config);
await graph.invoke({ messages: [new HumanMessage({ id: "h2", content: "ฉันชอบสุนัข" })] }, config);

const before: BaseMessage[] = (await graph.getState(config)).values.messages ?? [];
// 👉 ข้อ 1 สร้าง RemoveMessage สำหรับข้อความ id "h1"
const removal: RemoveMessage = todo(1);
await graph.updateState(config, { messages: [removal] });
const after: BaseMessage[] = (await graph.getState(config)).values.messages ?? [];

console.log("ก่อนลบ", before.map((message) => message.text));
console.log("หลังลบ", after.map((message) => message.text));

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("ลบเฉพาะข้อความ h1", before.length === 4 && after.length === 3 && after.every((m) => m.id !== "h1") && after.some((m) => m.id === "h2"));
