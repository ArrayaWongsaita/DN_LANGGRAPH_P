import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const MAX_ROUNDS = 3;

const State = new StateSchema({
  topic: z.string().default(""),
  draft: z.string().default(""),
  feedback: z.string().default(""),
  approved: z.boolean().default(false),
  round: z.number().default(0),
});

export function buildOptimizer(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("generate", async (state) => {
      // 👉 ข้อ 1: prompt = `เขียนเกี่ยวกับ ${state.topic}` ถ้ามี state.feedback ให้ต่อท้ายด้วย `\nแก้ตามข้อติ: ${state.feedback}`
      //          เรียก llm.invoke(prompt) แล้วคืน { draft: .text, round: state.round + 1 }
      return todo(1);
    })
    .addNode("evaluate", async (state) => {
      // 👉 ข้อ 2: ใช้ llm.withStructuredOutput(z.object({ approved: z.boolean(), feedback: z.string() }))
      //          invoke ด้วย `ตรวจงานนี้: ${state.draft}` แล้วคืน { approved: ผล.approved, feedback: ผล.feedback }
      return todo(2);
    })
    .addEdge(START, "generate")
    .addEdge("generate", "evaluate")
    .addConditionalEdges(
      "evaluate",
      (state) => {
        // 👉 ข้อ 3: คืน END ถ้า state.approved หรือ state.round >= MAX_ROUNDS ไม่เช่นนั้นคืน "generate"
        return todo(3);
      },
      ["generate", END],
    )
    .compile();
}
