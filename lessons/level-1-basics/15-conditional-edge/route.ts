import { todo } from "@src/todo";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 1-15  (ไม่ใช้ LLM)
// state: ข้อมูลที่ไหลผ่าน graph (ชื่อ node ห้ามซ้ำกับชื่อ field เหล่านี้)
const State = new StateSchema({
  question: z.string(),
  path: z.string().default(""),
});

// router: ฟังก์ชันที่ดู state แล้วบอกว่า "ไปทางไหนต่อ" (ให้มาแล้ว)
function routeByLength(state: { question: string }): "short" | "long" {
  return state.question.length <= 20 ? "short" : "long";
}

const graph = new StateGraph(State)
  .addNode("short", () => ({ path: "short" }))
  .addNode("long", () => ({ path: "long" }));

// 👉 ข้อ 1: จาก START ให้เลือกทางด้วย routeByLength (ไป "short" หรือ "long")
// แนวทาง: graph.addConditionalEdges(START, routeByLength, ["short", "long"]);
todo(1);

// 👉 ข้อ 2: ต่อ node "short" และ "long" ไปที่ END
// แนวทาง: graph.addEdge("short", END); แล้วทำแบบเดียวกันกับ "long"
todo(2);

const app = graph.compile();
const results: Record<string, string> = {};
for (const question of ["สวัสดี", "ช่วยอธิบายเรื่อง LangGraph ให้หน่อย", "ก".repeat(20), "ก".repeat(21)]) {
  const result = await app.invoke({ question });
  results[question] = result.path;
  console.log(`"${question}" (${question.length} ตัวอักษร) -> ${result.path}`);
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("คำถามสั้นไปทาง short", results["สวัสดี"] === "short", "ต่อ conditional edge จาก START");
check("คำถามยาวไปทาง long", results["ช่วยอธิบายเรื่อง LangGraph ให้หน่อย"] === "long");
check("ยาว 20 ตัวอักษรพอดี ยังนับเป็น short (ขอบเขต)", results["ก".repeat(20)] === "short");
check("ยาว 21 ตัวอักษรเป็น long", results["ก".repeat(21)] === "long");
