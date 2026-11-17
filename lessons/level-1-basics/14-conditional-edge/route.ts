import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

// state: ข้อมูลที่ไหลผ่าน graph (ชื่อ node ห้ามซ้ำกับชื่อ field เหล่านี้)
const State = new StateSchema({
  question: z.string(),
  path: z.string().default(""),
});

// router: ฟังก์ชันที่ดู state แล้วบอกว่า "ไปทางไหนต่อ" (ให้มาแล้ว)
export function routeByLength(state: { question: string }): "short" | "long" {
  return state.question.length <= 20 ? "short" : "long";
}

export function buildRouteGraph() {
  const graph = new StateGraph(State)
    .addNode("short", () => ({ path: "short" }))
    .addNode("long", () => ({ path: "long" }));

  // 👉 ข้อ 1: จาก START ให้เลือกทางด้วย routeByLength (ไป "short" หรือ "long")
  // แนวทาง: graph.addConditionalEdges(START, routeByLength, ["short", "long"]);
  todo(1);

  // 👉 ข้อ 2: ต่อ node "short" และ "long" ไปที่ END
  // แนวทาง: graph.addEdge("short", END); แล้วทำแบบเดียวกันกับ "long"
  todo(2);

  return graph.compile();
}
