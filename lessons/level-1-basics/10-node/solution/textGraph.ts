import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  text: z.string(),
  length: z.number().default(0),
});
type TextState = typeof State.State;

export function clean(state: TextState): Partial<TextState> {
  return { text: state.text.trim() };
}

export function measure(state: TextState): Partial<TextState> {
  return { length: state.text.length };
}

export function buildTextGraph() {
  return new StateGraph(State)
    .addNode("clean", clean)
    .addNode("measure", measure)
    .addEdge(START, "clean")
    .addEdge("clean", "measure")
    .addEdge("measure", END)
    .compile();
}
