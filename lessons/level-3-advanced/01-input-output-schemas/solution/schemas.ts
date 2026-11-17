import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const Full = new StateSchema({
  question: z.string().default(""),
  scratch: z.string().default(""),
  answer: z.string().default(""),
});
const In = new StateSchema({ question: z.string() });
const Out = new StateSchema({ answer: z.string() });

export function buildSchemaGraph() {
  return new StateGraph({ state: Full, input: In, output: Out })
    .addNode("think", (state) => ({
      scratch: `คิดเรื่อง: ${state.question}`,
      answer: `คำตอบของ: ${state.question}`,
    }))
    .addEdge(START, "think")
    .addEdge("think", END)
    .compile();
}
