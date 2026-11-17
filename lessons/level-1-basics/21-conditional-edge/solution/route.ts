import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  question: z.string().default(""),
  path: z.string().default(""),
});

// router = ฟังก์ชันที่ดู state แล้วบอกชื่อ node ที่จะไปต่อ
export function routeByLength(state: { question: string }): "short" | "long" {
  return state.question.length <= 20 ? "short" : "long";
}

export function buildRouteGraph() {
  return new StateGraph(State)
    .addNode("short", () => ({ path: "short" }))
    .addNode("long", () => ({ path: "long" }))
    .addConditionalEdges(START, routeByLength, ["short", "long"])
    .addEdge("short", END)
    .addEdge("long", END)
    .compile();
}
