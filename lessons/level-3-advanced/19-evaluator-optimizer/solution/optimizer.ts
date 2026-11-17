import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

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
      const prompt = `เขียนเกี่ยวกับ ${state.topic}` + (state.feedback ? `\nแก้ตามข้อติ: ${state.feedback}` : "");
      return { draft: (await llm.invoke(prompt)).text, round: state.round + 1 };
    })
    .addNode("evaluate", async (state) => {
      const verdict = await llm
        .withStructuredOutput(z.object({ approved: z.boolean(), feedback: z.string() }))
        .invoke(`ตรวจงานนี้: ${state.draft}`);
      return { approved: verdict.approved, feedback: verdict.feedback };
    })
    .addEdge(START, "generate")
    .addEdge("generate", "evaluate")
    .addConditionalEdges(
      "evaluate",
      (state) => (state.approved || state.round >= MAX_ROUNDS ? END : "generate"),
      ["generate", END],
    )
    .compile();
}
