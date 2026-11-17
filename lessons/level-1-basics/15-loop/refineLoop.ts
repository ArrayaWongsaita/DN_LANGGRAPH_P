import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const State = new StateSchema({
  last: z.string().default(""),
  rounds: z.number().default(0),
});
type LoopState = typeof State.State;

// router: ดู state แล้วตัดสินว่า "วนอีกรอบ" (คืนชื่อ node "refine") หรือ "หยุด" (คืน END)
export function shouldContinue(state: Pick<LoopState, "last" | "rounds">, maxRounds: number): "refine" | typeof END {
  // 👉 ข้อ 1: หยุด (คืน END) ถ้า LLM ตอบ "OK" (ตัดช่องว่างแล้วเท่ากับ "OK") หรือทำครบ maxRounds รอบแล้ว
  //          นอกนั้นให้วนต่อ (คืน "refine")
  // แนวทาง: state.last.trim() === "OK" || state.rounds >= maxRounds ? END : "refine"
  return todo(1);
}

export function buildRefineLoop(llm: BaseChatModel, maxRounds: number) {
  const graph = new StateGraph(State)
    .addNode("refine", async (state) => {
      const reply = await llm.invoke("ปรับปรุงงานให้ดีขึ้น ถ้าดีแล้วตอบว่า OK");
      return { last: reply.text, rounds: state.rounds + 1 };
    })
    .addEdge(START, "refine");

  // 👉 ข้อ 2: ต่อ conditional edge จาก "refine" โดยใช้ shouldContinue เป็น router
  //          ปลายทางที่เป็นไปได้คือ "refine" (วนกลับ) และ END
  // แนวทาง: graph.addConditionalEdges("refine", (s) => shouldContinue(s, maxRounds), ["refine", END]);
  todo(2);

  return graph.compile();
}
