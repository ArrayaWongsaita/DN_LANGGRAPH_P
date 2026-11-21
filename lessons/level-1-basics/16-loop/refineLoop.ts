import { todo } from "@src/todo";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

const maxRounds = 3;
const State = new StateSchema({
  replies: z.array(z.string()),
  last: z.string().default(""),
  rounds: z.number().default(0),
});

function shouldContinue(state: typeof State.State): "refine" | typeof END {
  // 👉 ข้อ 1 คืน END เมื่อ last ตัดช่องว่างแล้วเป็น OK หรือเมื่อ rounds ถึง maxRounds
  // ถ้ายังทำต่อได้ให้คืน "refine"
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   return state.last.trim() === "OK" || state.rounds >= maxRounds ? END : "refine";
  return todo(1);
}

const app = new StateGraph(State)
  .addNode("refine", (state) => ({
    last: state.replies[state.rounds] ?? "ยังต้องปรับ",
    rounds: state.rounds + 1,
  }))
  .addEdge(START, "refine")
  .addConditionalEdges("refine", shouldContinue, ["refine", END])
  .compile();

const approved = await app.invoke({ replies: ["ฉบับปรับครั้งแรก", " OK "] });
const capped = await app.invoke({
  replies: ["ฉบับปรับครั้งแรก", "OK แต่ยังต้องปรับ", "ฉบับปรับครั้งที่สาม"],
});
console.log(`${approved.rounds} รอบ -> ${JSON.stringify(approved.last)}`);
console.log(`${capped.rounds} รอบ -> ${JSON.stringify(capped.last)}`);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("วนอีกรอบเมื่อผลแรกยังไม่ใช่ OK", approved.rounds > 1, "ให้ router คืน refine เมื่อยังมีรอบเหลือ");
check("หยุดทันทีที่ได้ OK แม้มีช่องว่าง", approved.rounds === 2 && approved.last.trim() === "OK", "ตรวจ last.trim()");
check("หยุดที่รอบสูงสุดแม้ยังต้องปรับ", capped.rounds === 3 && capped.last === "ฉบับปรับครั้งที่สาม", "ตรวจ rounds >= maxRounds");
