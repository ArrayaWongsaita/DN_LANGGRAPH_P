import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const S = new StateSchema({ log: z.string().default("") });

// subgraph: ถามยืนยัน
const confirm = new StateGraph(S)
  .addNode("ask", (state) => {
    const answer = interrupt("ยืนยันไหม?");
    return { log: `${state.log}|ตอบ:${answer}` };
  })
  .addEdge(START, "ask")
  .addEdge("ask", END)
  .compile();

export function buildApp() {
  const builder = new StateGraph(S)
    .addNode("prepare", (state) => ({ log: `${state.log}เตรียม` }))
    .addNode("confirm", confirm)
    .addEdge(START, "prepare")
    .addEdge("prepare", "confirm")
    .addEdge("confirm", END);
  // 👉 ข้อ 1: compile ที่ graph แม่พร้อม checkpointer: new MemorySaver()
  return todo(1);
}

type App = ReturnType<typeof buildApp>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

export async function begin(app: App, threadId: string): Promise<boolean> {
  return isInterrupted(await app.invoke({}, cfg(threadId)));
}

export async function reply(app: App, threadId: string, answer: string): Promise<string> {
  // 👉 ข้อ 2: invoke ด้วย new Command({ resume: answer }) และ cfg(threadId) แล้วคืน .log
  return todo(2);
}
