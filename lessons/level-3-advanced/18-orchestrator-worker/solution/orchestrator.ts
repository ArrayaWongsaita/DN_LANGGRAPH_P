import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  goal: z.string().default(""),
  tasks: z.array(z.string()).default(() => []),
  results: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
  report: z.string().default(""),
});

const MAX_TASKS = 5;

export function buildOrchestrator(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("plan", async (state) => {
      const plan = await llm
        .withStructuredOutput(z.object({ tasks: z.array(z.string()) }))
        .invoke(`แตกเป้าหมายนี้เป็นงานย่อย: ${state.goal}`);
      return { tasks: plan.tasks.slice(0, MAX_TASKS) };
    })
    .addNode("worker", async (input: unknown) => {
      const { task } = input as { task: string };
      return { results: (await llm.invoke(`ทำงานย่อย: ${task}`)).text };
    })
    .addNode("synthesize", async (state) => ({
      report: (await llm.invoke(`รวมผลต่อไปนี้เป็นรายงาน: ${state.results.join("; ")}`)).text,
    }))
    .addEdge(START, "plan")
    .addConditionalEdges("plan", (state) => state.tasks.map((task) => new Send("worker", { task })), ["worker"])
    .addEdge("worker", "synthesize")
    .addEdge("synthesize", END)
    .compile();
}
