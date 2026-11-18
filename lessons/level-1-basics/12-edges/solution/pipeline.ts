import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 12  (ไม่ใช้ LLM)
// แต่ละ node ต่อชื่อตัวเองท้าย trace เพื่อให้เรารู้ว่าเดินผ่านลำดับไหน
const State = new StateSchema({
  trace: z.string().default(""),
});

const graph = new StateGraph(State)
  .addNode("first", (s) => ({ trace: s.trace ? `${s.trace}>first` : "first" }))
  .addNode("second", (s) => ({ trace: s.trace ? `${s.trace}>second` : "second" }));

// edge = เส้นเชื่อมว่า "หลังจากขั้นนี้ ไปขั้นไหนต่อ"  เขียนว่า graph.addEdge(จาก, ไป)
// START คือจุดเริ่ม และ END คือจุดจบของ graph

// ข้อ 1: ต่อจากจุดเริ่ม (START) ไปที่ node "first"
graph.addEdge(START, "first");

// ข้อ 2: ต่อ "first" ไปที่ "second"
graph.addEdge("first", "second");

// ข้อ 3: ต่อ "second" ไปที่จุดจบ (END)
graph.addEdge("second", END);

const result = await graph.compile().invoke({});
console.log("เดินผ่าน:", result.trace);
check("เดินผ่าน first แล้ว second ตามลำดับ", result.trace === "first>second", "ต่อ START -> first -> second -> END");
