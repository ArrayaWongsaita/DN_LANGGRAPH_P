import { todo } from "@src/todo";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 15  (ไม่เกิน 3 รอบ) เริ่มจากข้อความ "แมวกินปลา" แล้วให้ LLM ปรับปรุงทีละรอบ
const maxRounds = 3;

const State = new StateSchema({
  last: z.string().default(""),
  rounds: z.number().default(0),
});
type LoopState = typeof State.State;

// router: ดู state แล้วตัดสินว่า "วนอีกรอบ" (คืนชื่อ node "refine") หรือ "หยุด" (คืน END)
function shouldContinue(state: Pick<LoopState, "last" | "rounds">, max: number): "refine" | typeof END {
  // 👉 ข้อ 1: หยุด (คืน END) ถ้า LLM ตอบ "OK" (ตัดช่องว่างแล้วเท่ากับ "OK") หรือทำครบ max รอบแล้ว
  //          นอกนั้นให้วนต่อ (คืน "refine")
  // แนวทาง: state.last.trim() === "OK" || state.rounds >= max ? END : "refine"
  return todo(1);
}

// ตรวจ router ก่อน (ไม่เรียก LLM)
check("ตอบ OK แล้วหยุด", shouldContinue({ last: "OK", rounds: 1 }, 5) === END, "ตรวจ state.last.trim() === 'OK'");
check("ยังไม่ OK และยังไม่ครบรอบ ให้วนกลับ refine", shouldContinue({ last: "ยังไม่ดี", rounds: 1 }, 5) === "refine");
check("ครบรอบสูงสุดแล้วหยุดแม้ยังไม่ OK", shouldContinue({ last: "ยังไม่ดี", rounds: 3 }, 3) === END, "ตรวจ state.rounds >= max");

const graph = new StateGraph(State)
  .addNode("refine", async (state) => {
    const reply = await llm.invoke(`ปรับปรุงข้อความนี้ให้ดีขึ้น ตอบด้วยข้อความที่ปรับปรุงแล้วเท่านั้น แต่ถ้าดีอยู่แล้วให้ตอบคำว่า OK คำเดียว:\n${state.last || "แมวกินปลา"}`);
    return { last: reply.text, rounds: state.rounds + 1 };
  })
  .addEdge(START, "refine");

// 👉 ข้อ 2: ต่อ conditional edge จาก "refine" โดยใช้ shouldContinue เป็น router
//          ปลายทางที่เป็นไปได้คือ "refine" (วนกลับ) และ END
// แนวทาง: graph.addConditionalEdges("refine", (s) => shouldContinue(s, maxRounds), ["refine", END]);
todo(2);

const result = await graph.compile().invoke({});
console.log(`ทำไป ${result.rounds} รอบ ตอบสุดท้าย:`, result.last);
check("graph วนอย่างน้อย 1 รอบ และไม่เกิน maxRounds", result.rounds >= 1 && result.rounds <= maxRounds, "ต่อ conditional edge จาก refine");
