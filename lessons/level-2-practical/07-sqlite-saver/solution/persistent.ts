import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { check } from "@src/check";

const State = new StateSchema({ messages: MessagesValue });

const builder = new StateGraph(State)
  .addNode("chat", () => ({ messages: [new AIMessage("รับทราบ")] }))
  .addEdge(START, "chat")
  .addEdge("chat", END);

const dir = mkdtempSync(join(tmpdir(), "lg-sqlite-"));
const file = join(dir, "memory.db");
const config = { configurable: { thread_id: "mali" } };
const runs = [
  { label: "เปิดไฟล์ครั้งแรก", storage: file, text: "ฉันชื่อมาลี" },
  { label: "เปิดไฟล์เดิมใหม่", storage: file, text: "ฉันชอบแมว" },
  { label: "เปิดฐานข้อมูลใน RAM", storage: ":memory:", text: "ฉันชอบแมว" },
];

const histories: string[][] = [];
try {
  for (const { label, storage, text } of runs) {
    const saver = SqliteSaver.fromConnString(storage);
    try {
      const graph = builder.compile({ checkpointer: saver });
      const result = await graph.invoke({ messages: [new HumanMessage(text)] }, config);
      histories.push(result.messages.map((message) => message.text));
      console.log(label, result.messages.length);
    } finally {
      saver.db.close();
    }
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("เปิดไฟล์เดิมแล้วอ่านประวัติต่อได้", histories[1].length === 4 && histories[1][0] === "ฉันชื่อมาลี");
check("ฐานข้อมูลใน RAM เริ่มด้วยประวัติว่าง", histories[2].length === 2);
