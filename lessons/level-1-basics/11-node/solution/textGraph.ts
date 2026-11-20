import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

const State = new StateSchema({
  text: z.string(),
  length: z.number().default(0),
});
type TextState = typeof State.State;

function clean(state: TextState): Partial<TextState> {
  return { text: state.text.trim() };
}

const app = new StateGraph(State)
  .addNode("clean", clean)
  .addNode("measure", (state) => ({ length: state.text.length }))
  .addEdge(START, "clean")
  .addEdge("clean", "measure")
  .addEdge("measure", END)
  .compile();

const result = await app.invoke({ text: "   abc   " });
console.log(result);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
// ─────────────────────────────────────────────────────────────
const original = { text: "  สวัสดี  ", length: 42 };
const update = clean(original);

check("clean คืนเฉพาะ text ที่ตัดช่องว่างรอบข้อความ", update.text === "สวัสดี" && Object.keys(update).length === 1, "คืน { text: state.text.trim() }");
check("State ที่ส่งเข้า clean ยังมีค่าเดิม", original.text === "  สวัสดี  " && original.length === 42, "ให้คืน object ใหม่");
check("measure ได้ข้อความที่ clean แล้ว", result.text === "abc" && result.length === 3);
