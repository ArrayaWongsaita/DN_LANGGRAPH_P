import { AIMessage, HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { check } from "@src/check";

const State = new StateSchema({ messages: MessagesValue });

const builder = new StateGraph(State)
  .addNode("chat", () => ({ messages: [new AIMessage("รับทราบ")] }))
  .addEdge(START, "chat")
  .addEdge("chat", END);

const checkpointer = new MemorySaver();
const graph = builder.compile({ checkpointer });
const config = { configurable: { thread_id: "mali" } };

const first = await graph.invoke({ messages: [new HumanMessage("ฉันชื่อมาลี")] }, config);
const second = await graph.invoke({ messages: [new HumanMessage("ฉันชอบแมว")] }, config);
const snapshot = await graph.getState(config);
const savedMessages: BaseMessage[] = snapshot.values.messages ?? [];

console.log("จำนวนข้อความแต่ละรอบ", [first.messages.length, second.messages.length]);
console.log("ใน checkpoint", savedMessages.map((message) => message.text));

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("รอบสองอ่านประวัติเดิมต่อได้", first.messages.length === 2 && second.messages.length === 4);
check("checkpoint ของ mali มีทั้งสองรอบ", savedMessages.map((m) => m.type).join(",") === "human,ai,human,ai");
