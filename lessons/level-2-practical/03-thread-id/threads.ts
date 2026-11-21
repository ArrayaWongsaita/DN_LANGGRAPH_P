import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { check } from "@src/check";
import { todo } from "@src/todo";

const State = new StateSchema({ messages: MessagesValue });

const graph = new StateGraph(State)
  .addNode("chat", () => ({ messages: [new AIMessage("รับทราบ")] }))
  .addEdge(START, "chat")
  .addEdge("chat", END)
  .compile({ checkpointer: new MemorySaver() });

const turns = [
  { threadId: "mali:งาน", text: "ส่งรายงานแล้ว" },
  { threadId: "somchai:งาน", text: "เริ่มทำรายงาน" },
  { threadId: "mali:งาน", text: "ตรวจรายงานแล้ว" },
];

const counts: number[] = [];
for (const { threadId, text } of turns) {
  const result = await graph.invoke(
    { messages: [new HumanMessage(text)] },
    // 👉 ข้อ 1 ระบุ thread_id ของรอบนี้ใน config
    // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
    //   { configurable: { thread_id: threadId } },
    todo(1),
  );
  counts.push(result.messages.length);
  console.log(threadId, result.messages.length);
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("แต่ละห้องเก็บประวัติของตัวเอง", counts.join(",") === "2,2,4", "ใช้ thread_id เดิมเมื่อต้องการคุยต่อ");
