import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

const State = new StateSchema({ trace: z.string().default("") });

const graph = new StateGraph(State)
  .addNode("first", (state) => ({ trace: state.trace ? `${state.trace}>first` : "first" }))
  .addNode("second", (state) => ({ trace: state.trace ? `${state.trace}>second` : "second" }))
  .addEdge(START, "first")
  .addEdge("second", END);

graph.addEdge("first", "second");

const result = await graph.compile().invoke({});
console.log(result.trace);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
// ─────────────────────────────────────────────────────────────
check("graph เดินผ่าน first แล้วจึงถึง second", result.trace === "first>second", "ต่อ first ไป second ด้วย addEdge()");
