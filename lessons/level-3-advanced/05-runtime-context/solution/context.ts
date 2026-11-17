import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({ out: z.string().default("") });

export function buildContextGraph() {
  return new StateGraph(State, { context: z.object({ lang: z.string().optional() }) })
    .addNode("greet", (state, runtime) => ({
      out: runtime.context?.lang === "en" ? "Hello" : "สวัสดี",
    }))
    .addEdge(START, "greet")
    .addEdge("greet", END)
    .compile();
}
