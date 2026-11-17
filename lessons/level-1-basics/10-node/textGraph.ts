import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const State = new StateSchema({
  text: z.string(),
  length: z.number().default(0),
});
type TextState = typeof State.State;

// node = ฟังก์ชันธรรมดา: รับ state ปัจจุบัน แล้วคืน "เฉพาะ field ที่อยากอัปเดต"
// (ห้ามแก้ state ตรง ๆ  ให้คืน object ใหม่ ส่วน field ที่ไม่ได้คืนจะคงค่าเดิม)

export function clean(state: TextState): Partial<TextState> {
  // 👉 ข้อ 1: คืน update ของ text ที่ตัดช่องว่างหัวท้ายแล้ว
  // แนวทาง: return { text: state.text.trim() };
  return todo(1);
}

export function measure(state: TextState): Partial<TextState> {
  // 👉 ข้อ 2: คืน update ของ length ซึ่งเท่ากับความยาวของ state.text
  // แนวทาง: return { length: state.text.length };
  return todo(2);
}

// การต่อ node เป็น graph (ให้มาแล้ว บทหน้าจะอธิบายเรื่อง edge)
export function buildTextGraph() {
  return new StateGraph(State)
    .addNode("clean", clean)
    .addNode("measure", measure)
    .addEdge(START, "clean")
    .addEdge("clean", "measure")
    .addEdge("measure", END)
    .compile();
}
