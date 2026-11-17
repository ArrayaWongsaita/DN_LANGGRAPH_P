import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

// แต่ละ node ต่อชื่อตัวเองท้าย trace เพื่อให้เรารู้ว่าเดินผ่านลำดับไหน
const State = new StateSchema({
  trace: z.string().default(""),
});

export function buildPipeline() {
  const graph = new StateGraph(State)
    .addNode("first", (s) => ({ trace: s.trace ? `${s.trace}>first` : "first" }))
    .addNode("second", (s) => ({ trace: s.trace ? `${s.trace}>second` : "second" }));

  // edge = เส้นเชื่อมว่า "หลังจากขั้นนี้ ไปขั้นไหนต่อ"  เขียนว่า graph.addEdge(จาก, ไป)
  // START คือจุดเริ่ม และ END คือจุดจบของ graph

  // 👉 ข้อ 1: ต่อจากจุดเริ่ม (START) ไปที่ node "first"
  // แนวทาง: graph.addEdge(START, "first");
  todo(1);

  // 👉 ข้อ 2: ต่อ "first" ไปที่ "second"
  todo(2);

  // 👉 ข้อ 3: ต่อ "second" ไปที่จุดจบ (END)
  todo(3);

  return graph.compile();
}
