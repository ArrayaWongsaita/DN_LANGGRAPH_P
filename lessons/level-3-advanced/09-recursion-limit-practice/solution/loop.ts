import { END, GraphRecursionError, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-09  (ไม่ใช้ LLM)
// graph ที่วนจนถึงเป้า: ต้องตั้งเพดาน (recursionLimit) ให้พอดี และจับ error เมื่อวนเกินเพดาน (ต่อจากบท 2-12)
const State = new StateSchema({
  n: z.number().default(0),
  target: z.number().default(0),
});

const graph = new StateGraph(State)
  .addNode("inc", (state) => ({ n: state.n + 1 }))
  .addEdge(START, "inc")
  .addConditionalEdges(
    "inc",
    (state) => {
      return state.n >= state.target ? END : "inc";
    },
    ["inc", END],
  )
  .compile();

const limitForRounds = (target: number): number => target + 2;

// สองกรณี: เพดานพอดี และเพดานต่ำเกินไป (5 ทั้งที่ต้องวน 50 รอบ)
const outcomes: string[] = [];
for (const [target, limit] of [[3, limitForRounds(3)], [50, 5]]) {
  try {
    const r = await graph.invoke({ target }, { recursionLimit: limit });
    outcomes.push(`ok:${r.n}`);
  } catch (e) {
    if (e instanceof GraphRecursionError) outcomes.push("limit");
    else throw e;
  }
}
console.log(outcomes);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("limitForRounds(3) = 5", limitForRounds(3) === 5);
check("เพดานพอดี วนครบ 3 รอบ", outcomes[0] === "ok:3", "router: คืน END เมื่อ n >= target");
check("เพดานต่ำเกินไป ถูกหยุดและจับ error ได้", outcomes[1] === "limit", "จับ GraphRecursionError");
