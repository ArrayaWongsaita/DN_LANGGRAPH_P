import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  question: z.string().default(""),
  answer: z.string().default(""),
});
type StateType = typeof State.State;

// node = ฟังก์ชันที่รับ state แล้วคืน "เฉพาะส่วนที่อยากอัปเดต"
export function greetNode(state: StateType): Partial<StateType> {
  return { answer: `สวัสดี ${state.question}` };
}

export function buildGreetGraph() {
  return new StateGraph(State)
    .addNode("greet", greetNode)
    .addEdge(START, "greet")
    .addEdge("greet", END)
    .compile();
}
