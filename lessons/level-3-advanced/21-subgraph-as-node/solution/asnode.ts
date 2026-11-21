import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-21  (ไม่ใช้ LLM)
// ถ้าแม่กับลูก "ใช้ State หน้าตาเดียวกัน" ใส่ subgraph เป็น node ได้ตรง ๆ ไม่ต้องแปลงข้อมูล

// State ที่ใช้ร่วมกัน (ทั้งแม่และลูกมี field text)
const TextState = new StateSchema({ text: z.string().default(""), length: z.number().default(0) });

const normalize = new StateGraph(TextState)
  .addNode("clean", (s) => ({ text: s.text.trim().toLowerCase() }))
  .addEdge(START, "clean")
  .addEdge("clean", END)
  .compile();

const measure = (s: { text: string }) => ({ length: s.text.length });

const builder = new StateGraph(TextState).addNode("measure", measure);
const pipeline = builder
  .addNode("normalize", normalize)
  .addEdge(START, "normalize")
  .addEdge("normalize", "measure")
  .addEdge("measure", END)
  .compile();

const result = await pipeline.invoke({ text: "  Hello World  " });
console.log(result);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("subgraph ทำความสะอาดข้อความ (trim + lowercase)", result.text === "hello world", "ใส่ normalize เป็น node ตรง ๆ");
check("node ถัดไปเห็นผลของ subgraph (length = 11)", result.length === 11, "ต่อ normalize -> measure");
