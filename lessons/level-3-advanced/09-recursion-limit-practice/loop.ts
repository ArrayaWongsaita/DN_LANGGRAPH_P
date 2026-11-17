import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { GraphRecursionError } from "@langchain/langgraph";
import { todo } from "@src/todo";

const State = new StateSchema({
  n: z.number().default(0),
  target: z.number().default(0),
});

export function buildLoopGraph() {
  return new StateGraph(State)
    .addNode("inc", (state) => ({ n: state.n + 1 }))
    .addEdge(START, "inc")
    .addConditionalEdges(
      "inc",
      (state) => {
        // 👉 ข้อ 1: คืน END ถ้า state.n >= state.target ไม่เช่นนั้นคืน "inc" (วนต่อ)
        return todo(1);
      },
      ["inc", END],
    )
    .compile();
}

// เพดาน step ที่พอดีสำหรับวนครบ target รอบ (เผื่อ 2 step)
export function limitForRounds(target: number): number {
  // 👉 ข้อ 2: คืน target + 2
  return todo(2);
}

export type LoopResult = { ok: true; n: number } | { ok: false; reason: string };

export async function runLoop(target: number, limit = limitForRounds(target)): Promise<LoopResult> {
  const graph = buildLoopGraph();
  try {
    const r = await graph.invoke({ target }, { recursionLimit: limit });
    return { ok: true, n: r.n };
  } catch (e) {
    // 👉 ข้อ 3: ถ้า e เป็น GraphRecursionError คืน { ok: false, reason: "วนเกินเพดาน" } ไม่เช่นนั้น throw ต่อ
    return todo(3);
  }
}
