import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-22
// streamMode "messages" = ได้ข้อความจาก LLM ทีละ token ระหว่างที่ graph ทำงาน (ทุก node ที่เรียก LLM) พร้อม metadata บอกว่ามาจาก node ไหน
const State = new StateSchema({ messages: MessagesValue });

const graph = new StateGraph(State)
  .addNode("draft", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
  .addNode("polish", async (state) => ({ messages: [await llm.invoke([...state.messages, new HumanMessage("ปรับให้กระชับขึ้น")])] }))
  .addEdge(START, "draft")
  .addEdge("draft", "polish")
  .addEdge("polish", END)
  .compile();

let all = ""; // ข้อความจากทุก node ต่อกัน
let fromPolish = ""; // เฉพาะข้อความจาก node "polish"
const nodes = new Set<string>();

for await (const [chunk, meta] of await graph.stream(
  { messages: [new HumanMessage("เขียนประโยคชวนไปเที่ยวทะเลหนึ่งประโยค")] },
  { streamMode: "messages" },
)) {
  nodes.add(meta.langgraph_node);
  // ข้อ 1: ต่อ chunk.text เข้า all (ทุก node)
  all += chunk.text;
  // ข้อ 2: ต่อ chunk.text เข้า fromPolish เฉพาะเมื่อ meta.langgraph_node === "polish"
  if (meta.langgraph_node === "polish") fromPolish += chunk.text;
}
console.log("จาก node ไหนบ้าง:", [...nodes]);
console.log("ทั้งหมด:", all);
console.log("เฉพาะ polish:", fromPolish);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ข้อความจากสอง node (draft และ polish)", nodes.has("draft") && nodes.has("polish"), 'streamMode: "messages" ให้ meta.langgraph_node');
check("all มีข้อความทั้งสอง node (ยาวกว่าเฉพาะ polish)", all.length > fromPolish.length && fromPolish.length > 0, "all ต่อทุก chunk, fromPolish ต่อเฉพาะ polish");
check("ข้อความของ polish อยู่ท้าย all (polish ทำงานหลัง draft)", all.endsWith(fromPolish));
