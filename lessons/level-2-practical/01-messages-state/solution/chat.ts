import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { check } from "@src/check";

const State = new StateSchema({ messages: MessagesValue });

const graph = new StateGraph(State)
  .addNode("chat", () => {
    const reply = new AIMessage("รับทราบ");
    return { messages: [reply] };
  })
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile();

const first = await graph.invoke({ messages: [new HumanMessage("ฉันชื่อมาลี")] });
const second = await graph.invoke({ messages: [new HumanMessage("ฉันชอบแมว")] });

console.log("รอบแรก", first.messages.map(({ type, text }) => ({ type, text })));
console.log("รอบสอง", second.messages.map(({ type, text }) => ({ type, text })));

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("รอบแรกเก็บข้อความผู้ใช้และคำตอบ", first.messages.map((m) => m.type).join(",") === "human,ai", "คืน { messages: [reply] } จาก node");
check("รอบสองมีข้อความของรอบตัวเอง", second.messages.length === 2 && second.messages[0].text === "ฉันชอบแมว");
