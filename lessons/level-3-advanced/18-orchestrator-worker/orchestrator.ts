import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
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
      // 👉 ข้อ 1: ใช้ llm.withStructuredOutput(z.object({ tasks: z.array(z.string()) })) เรียก invoke ด้วย
      //          `แตกเป้าหมายนี้เป็นงานย่อย: ${state.goal}` แล้วคืน { tasks: ผล.tasks.slice(0, MAX_TASKS) }
      return todo(1);
    })
    .addNode("worker", async (input: unknown) => {
      const { task } = input as { task: string };
      return { results: (await llm.invoke(`ทำงานย่อย: ${task}`)).text };
    })
    .addNode("synthesize", async (state) => {
      // 👉 ข้อ 3: เรียก llm.invoke(`รวมผลต่อไปนี้เป็นรายงาน: ${state.results.join("; ")}`) แล้วคืน { report: .text }
      return todo(3);
    })
    .addEdge(START, "plan")
    .addConditionalEdges(
      "plan",
      (state) => {
        // 👉 ข้อ 2: คืนรายการ Send ต่อหนึ่ง task: new Send("worker", { task })
        return todo(2);
      },
      ["worker"],
    )
    .addEdge("worker", "synthesize")
    .addEdge("synthesize", END)
    .compile();
}
