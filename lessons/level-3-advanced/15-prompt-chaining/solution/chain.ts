import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  topic: z.string().default(""),
  draft: z.string().default(""),
  final: z.string().default(""),
});

export function buildChain(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("write", async (state) => ({
      draft: (await llm.invoke(`เขียนย่อหน้าเกี่ยวกับ ${state.topic}`)).text,
    }))
    .addNode("polish", async (state) => ({
      final: (await llm.invoke(`ขัดเกลาข้อความนี้ให้สละสลวย: ${state.draft}`)).text,
    }))
    .addNode("tooShort", () => ({ final: "ร่างสั้นเกินไป" }))
    .addEdge(START, "write")
    .addConditionalEdges("write", (state) => (state.draft.length >= 10 ? "polish" : "tooShort"), ["polish", "tooShort"])
    .addEdge("polish", END)
    .addEdge("tooShort", END)
    .compile();
}
