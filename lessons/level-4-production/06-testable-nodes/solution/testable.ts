import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  text: z.string().default(""),
  summary: z.string().default(""),
});

export function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function makeSummarizeNode(llm: BaseChatModel) {
  return async (state: { text: string }) => {
    const reply = await llm.invoke(`สรุปสั้น ๆ: ${state.text}`);
    return { summary: reply.text };
  };
}

export function buildPipeline(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("clean", (state) => ({ text: cleanText(state.text) }))
    .addNode("summarize", makeSummarizeNode(llm))
    .addEdge(START, "clean")
    .addEdge("clean", "summarize")
    .addEdge("summarize", END)
    .compile();
}
