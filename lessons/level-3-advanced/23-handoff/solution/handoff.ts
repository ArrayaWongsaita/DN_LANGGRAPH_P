import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";

const S = new StateSchema({
  message: z.string().default(""),
  log: z.string().default(""),
});

const sales = new StateGraph(S)
  .addNode("handle", (state) => {
    if (state.message.includes("พัง")) {
      return new Command({ update: { log: `${state.log}sales→support;` }, goto: "support", graph: Command.PARENT });
    }
    return { log: `${state.log}sales ตอบเอง;` };
  })
  .addEdge(START, "handle")
  .compile();

export function buildTeam() {
  return new StateGraph(S)
    .addNode("support", (state) => ({ log: `${state.log}support รับช่วง;` }))
    .addNode("sales", sales, { ends: ["support"] })
    .addEdge(START, "sales")
    .addEdge("sales", END)
    .addEdge("support", END)
    .compile();
}
