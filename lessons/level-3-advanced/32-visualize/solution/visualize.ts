import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-32  (ไม่ใช้ LLM)
// graph วาดตัวเองเป็นแผนภาพ (Mermaid) ได้: ใช้ดูว่าต่อ edge ถูกหรือไม่ และเอาไปใส่เอกสารได้
const State = new StateSchema({ n: z.number().default(0) });

const graph = new StateGraph(State)
  .addNode("inc", (s) => ({ n: s.n + 1 }))
  .addNode("done", (s) => ({ n: s.n }))
  .addEdge(START, "inc")
  .addConditionalEdges("inc", (s) => (s.n >= 3 ? "done" : "inc"), ["inc", "done"])
  .addEdge("done", END)
  .compile();

const g = await graph.getGraphAsync();
const mermaid: string = g.drawMermaid();

const names: string[] = Object.keys((await graph.getGraphAsync()).nodes).filter((n) => !n.startsWith("__"));
console.log(mermaid);
console.log("node:", names);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้แผนภาพ Mermaid ที่มีชื่อ node inc และ done", typeof mermaid === "string" && mermaid.includes("inc") && mermaid.includes("done"), "ใช้ (await graph.getGraphAsync()).drawMermaid()");
check("รายชื่อ node ที่ประกาศเองมีแค่ inc และ done", JSON.stringify([...names].sort()) === '["done","inc"]', "กรองชื่อที่ขึ้นต้นด้วย __ ออก");
