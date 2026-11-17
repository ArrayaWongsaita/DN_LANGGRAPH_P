import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  amount: z.number().default(0),
  log: z.string().default(""),
});

export function buildGotoGraph() {
  return new StateGraph(State)
    .addNode(
      "triage",
      (state) => new Command({ update: { log: "triage" }, goto: state.amount >= 1000 ? "premium" : "basic" }),
      { ends: ["premium", "basic"] },
    )
    .addNode("premium", (state) => ({ log: `${state.log}>premium` }))
    .addNode("basic", (state) => ({ log: `${state.log}>basic` }))
    .addEdge(START, "triage")
    .addEdge("premium", END)
    .addEdge("basic", END)
    .compile();
}
