// รันแบบออฟไลน์ ใช้แชตโมเดลจำลองที่ส่งชิ้นข้อความตามที่กำหนด
import { AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import { FakeStreamingChatModel } from "@langchain/core/utils/testing";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { check } from "@src/check";

const draftModel = new FakeStreamingChatModel({
  chunks: [new AIMessageChunk("ขอเสนอ "), new AIMessageChunk("ไปทะเล")],
});
const polishModel = new FakeStreamingChatModel({
  chunks: [new AIMessageChunk("ไปทะเล"), new AIMessageChunk("กันเถอะ!")],
});

const State = new StateSchema({ messages: MessagesValue });
const graph = new StateGraph(State)
  .addNode("draft", async (state) => ({ messages: [await draftModel.invoke(state.messages)] }))
  .addNode("polish", async (state) => ({ messages: [await polishModel.invoke(state.messages)] }))
  .addEdge(START, "draft")
  .addEdge("draft", "polish")
  .addEdge("polish", END)
  .compile();

const visibleNode = "polish";
let answer = "";
const stream = await graph.stream(
  { messages: [new HumanMessage("ชวนไปเที่ยวทะเล")] },
  { streamMode: "messages" },
);
for await (const [chunk, meta] of stream) {
  console.log(meta.langgraph_node, JSON.stringify(chunk.text));
  if (meta.langgraph_node === visibleNode) answer += chunk.text;
}
console.log("คำตอบที่แสดง", JSON.stringify(answer));












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ต่อเฉพาะชิ้นข้อความจาก polish", answer === "ไปทะเลกันเถอะ!", "กรองด้วย meta.langgraph_node แล้วต่อ chunk.text ทุกชิ้นที่ผ่าน");
