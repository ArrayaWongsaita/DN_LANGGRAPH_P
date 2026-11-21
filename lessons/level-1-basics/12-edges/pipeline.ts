import { todo } from "@src/todo";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

const State = new StateSchema({ trace: z.string().default("") });

const graph = new StateGraph(State)
  .addNode("first", (state) => ({ trace: state.trace ? `${state.trace}>first` : "first" }))
  .addNode("second", (state) => ({ trace: state.trace ? `${state.trace}>second` : "second" }))
  .addEdge(START, "first")
  .addEdge("second", END);

// 👉 ข้อ 1 ต่อเส้นจาก first ไป second
// แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
//   graph.addEdge("first", "second");
todo(1);

const result = await graph.compile().invoke({});
console.log(result.trace);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("graph เดินผ่าน first แล้วจึงถึง second", result.trace === "first>second", "ต่อ first ไป second ด้วย addEdge()");
