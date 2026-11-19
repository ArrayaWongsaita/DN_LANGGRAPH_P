import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 11  (ไม่ใช้ LLM)
const State = new StateSchema({
  text: z.string(),
  length: z.number().default(0),
});
type TextState = typeof State.State;

// node = ฟังก์ชันธรรมดา: รับ state ปัจจุบัน แล้วคืน "เฉพาะ field ที่อยากอัปเดต"
// (ห้ามแก้ state ตรง ๆ  ให้คืน object ใหม่ ส่วน field ที่ไม่ได้คืนจะคงค่าเดิม)

function clean(state: TextState): Partial<TextState> {
  // ข้อ 1: คืน update ของ text ที่ตัดช่องว่างหัวท้ายแล้ว
  return { text: state.text.trim() };
}

function measure(state: TextState): Partial<TextState> {
  // ข้อ 2: คืน update ของ length ซึ่งเท่ากับความยาวของ state.text
  return { length: state.text.length };
}

// การต่อ node เป็น graph (ให้มาแล้ว บทหน้าจะอธิบายเรื่อง edge)
const graph = new StateGraph(State)
  .addNode("clean", clean)
  .addNode("measure", measure)
  .addEdge(START, "clean")
  .addEdge("clean", "measure")
  .addEdge("measure", END)
  .compile();

const result = await graph.invoke({ text: "   abc   " });
console.log(result);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const original = { text: " x ", length: 0 };
clean(original);
check("clean ตัดช่องว่างหัวท้ายของ text", clean({ text: "  สวัสดี  ", length: 0 }).text === "สวัสดี", "ใช้ state.text.trim()");
check("measure คืน length ของ text", measure({ text: "สวัสดี", length: 0 }).length === 6, "ใช้ state.text.length");
check("graph ทำ clean แล้ว measure ตามลำดับ", result.text === "abc" && result.length === 3);
check("node ไม่แก้ state เดิมโดยตรง", original.text === " x ", "ให้คืน object ใหม่ ห้ามแก้ state");
