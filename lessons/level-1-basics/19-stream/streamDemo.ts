import { END, START, StateGraph, StateSchema, type StreamMode } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";
import { todo } from "@src/todo";

const State = new StateSchema({ text: z.string(), length: z.number().default(0) });
const graph = new StateGraph(State)
  .addNode("clean", ({ text }) => ({ text: text.trim() }))
  .addNode("measure", ({ text }) => ({ length: text.length }))
  .addEdge(START, "clean")
  .addEdge("clean", "measure")
  .addEdge("measure", END)
  .compile();

const input = { text: "  abc  " };
// 👉 ข้อ 1 เลือก streamMode ที่คืนเฉพาะค่าที่ node อัปเดต
// แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
//   const diffMode: StreamMode = "updates";
const diffMode: StreamMode = todo(1);
const updates: unknown[] = [];
for await (const chunk of await graph.stream(input, { streamMode: diffMode })) {
  updates.push(chunk);
}

const values: unknown[] = [];
for await (const chunk of await graph.stream(input, { streamMode: "values" })) {
  values.push(chunk);
}

console.log("updates", JSON.stringify(updates));
console.log("values", JSON.stringify(values));












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("updates มีเฉพาะค่าที่แต่ละ node คืน", JSON.stringify(updates) === '[{"clean":{"text":"abc"}},{"measure":{"length":3}}]');
check(
  "values มี State เริ่มต้นและ State หลังแต่ละ node",
  JSON.stringify(values) === '[{"text":"  abc  ","length":0},{"text":"abc","length":0},{"text":"abc","length":3}]',
);
