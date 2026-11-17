import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  question: z.string(),
  answer: z.string().default(""),
});

export function buildAskGraph(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("ask", async (state) => {
      const reply = await llm.invoke(state.question);
      return { answer: reply.text };
    })
    .addEdge(START, "ask")
    .addEdge("ask", END)
    .compile();
}
