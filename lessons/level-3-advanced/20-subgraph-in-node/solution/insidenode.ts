import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const CounterState = new StateSchema({ text: z.string().default(""), wc: z.number().default(0) });
export const counter = new StateGraph(CounterState)
  .addNode("count", (s) => ({ wc: s.text.split(" ").length }))
  .addEdge(START, "count")
  .addEdge("count", END)
  .compile();

const ParentState = new StateSchema({ doc: z.string().default(""), count: z.number().default(0) });

export function buildParent() {
  return new StateGraph(ParentState)
    .addNode("callCounter", async (state) => {
      const result = await counter.invoke({ text: state.doc });
      return { count: result.wc };
    })
    .addEdge(START, "callCounter")
    .addEdge("callCounter", END)
    .compile();
}
