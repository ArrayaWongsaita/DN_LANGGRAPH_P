import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

const State = new StateSchema({
  question: z.string(),
  path: z.string().default(""),
});

function routeByLength(state: typeof State.State): "short" | "long" {
  return state.question.length <= 20 ? "short" : "long";
}

const graph = new StateGraph(State)
  .addNode("short", () => ({ path: "short" }))
  .addNode("long", () => ({ path: "long" }))
  .addEdge("short", END)
  .addEdge("long", END);

graph.addConditionalEdges(START, routeByLength, ["short", "long"]);

const app = graph.compile();
const short = await app.invoke({ question: "สวัสดี" });
const long = await app.invoke({ question: "ช่วยอธิบายเรื่อง LangGraph ให้หน่อย" });
console.log(`"${short.question}" (${short.question.length}) -> ${short.path}`);
console.log(`"${long.question}" (${long.question.length}) -> ${long.path}`);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("คำถามสั้นไปทาง short", short.path === "short", "ต่อ conditional edge จาก START");
check("คำถามยาวไปทาง long", long.path === "long");
const atLimit = await app.invoke({ question: "ก".repeat(20) });
const overLimit = await app.invoke({ question: "ก".repeat(21) });
check("ความยาว 20 ไปทาง short", atLimit.path === "short");
check("ความยาว 21 ไปทาง long", overLimit.path === "long");
