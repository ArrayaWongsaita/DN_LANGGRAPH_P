import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({ result: z.string().default("") });

// edge = ลูกศรบอกว่า node ไหนทำต่อจาก node ไหน เริ่มที่ START จบที่ END
export function buildTwoStepGraph(log: string[]) {
  return new StateGraph(State)
    .addNode("first", () => {
      log.push("first");
      return { result: "first" };
    })
    .addNode("second", () => {
      log.push("second");
      return { result: "second" };
    })
    .addEdge(START, "first")
    .addEdge("first", "second")
    .addEdge("second", END)
    .compile();
}

// graph ที่ลืมต่อ edge จาก START: compile แล้วจะ error
export function buildBrokenGraph() {
  return new StateGraph(State)
    .addNode("lonely", () => ({ result: "x" }))
    .addEdge("lonely", END)
    .compile();
}
