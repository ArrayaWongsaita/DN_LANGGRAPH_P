import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-07
// MemorySaver หายเมื่อปิดโปรแกรม: SqliteSaver เก็บลงไฟล์ จึงจำได้แม้ "รีสตาร์ต"
const State = new StateSchema({ messages: MessagesValue });

// สร้าง graph แชตที่ใช้ saver ที่ส่งเข้ามา (เราจะเรียกใช้สองครั้ง เพื่อจำลองการรีสตาร์ต)
function buildChat(saver: SqliteSaver) {
  const builder = new StateGraph(State)
    .addNode("chat", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
    .addEdge(START, "chat")
    .addEdge("chat", END);
  // ข้อ 1: compile พร้อม checkpointer: saver
  return builder.compile({ checkpointer: saver });
}

const dir = mkdtempSync(join(tmpdir(), "lg-sqlite-"));
const file = join(dir, "memory.db");
const config = { configurable: { thread_id: "user-1" } };

// ข้อ 2: สร้าง SqliteSaver ที่เก็บลงไฟล์ file
const saver: SqliteSaver = SqliteSaver.fromConnString(file);
await buildChat(saver).invoke({ messages: [new HumanMessage("ฉันชื่อมาลี")] }, config);

// "รีสตาร์ต": สร้าง saver และ graph ใหม่จากไฟล์เดิม
const restarted = buildChat(SqliteSaver.fromConnString(file));
const result = await restarted.invoke({ messages: [new HumanMessage("ฉันชื่ออะไร")] }, config);
const reply = result.messages[result.messages.length - 1].text;
console.log("หลังรีสตาร์ต LLM ตอบ:", reply);

// ไฟล์อื่น = ความจำคนละก้อน
const other = buildChat(SqliteSaver.fromConnString(join(dir, "other.db")));
const otherResult = await other.invoke({ messages: [new HumanMessage("ฉันชื่ออะไร")] }, config);
rmSync(dir, { recursive: true, force: true });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("หลังรีสตาร์ต ประวัติเดิมยังอยู่ (4 ข้อความ)", result.messages.length === 4, "ต้องใช้ SqliteSaver ที่ชี้ไปไฟล์เดิม");
check("หลังรีสตาร์ต LLM จำชื่อ 'มาลี' ได้", reply.includes("มาลี"));
check("คนละไฟล์ = คนละความจำ (มีแค่ 2 ข้อความ)", otherResult.messages.length === 2);
