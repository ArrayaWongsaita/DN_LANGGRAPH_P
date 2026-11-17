import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  question: z.string().default(""),
  answer: z.string().default(""),
});
type StateType = typeof State.State;

// node ที่เรียก LLM: รับ llm เข้ามา (dependency injection) จึงสลับเป็นตัวปลอมใน test ได้
export function makeAnswerNode(llm: BaseChatModel) {
  return async (state: StateType): Promise<Partial<StateType>> => {
    const response = await llm.invoke(state.question);
    return { answer: String(response.content) };
  };
}

export function buildAnswerGraph(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("ask", makeAnswerNode(llm))
    .addEdge(START, "ask")
    .addEdge("ask", END)
    .compile();
}
