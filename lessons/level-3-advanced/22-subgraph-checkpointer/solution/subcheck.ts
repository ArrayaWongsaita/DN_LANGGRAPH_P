import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";

const S = new StateSchema({ log: z.string().default("") });

const confirm = new StateGraph(S)
  .addNode("ask", (state) => {
    const answer = interrupt("ยืนยันไหม?");
    return { log: `${state.log}|ตอบ:${answer}` };
  })
  .addEdge(START, "ask")
  .addEdge("ask", END)
  .compile();

export function buildApp() {
  return new StateGraph(S)
    .addNode("prepare", (state) => ({ log: `${state.log}เตรียม` }))
    .addNode("confirm", confirm)
    .addEdge(START, "prepare")
    .addEdge("prepare", "confirm")
    .addEdge("confirm", END)
    .compile({ checkpointer: new MemorySaver() });
}

type App = ReturnType<typeof buildApp>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

export async function begin(app: App, threadId: string): Promise<boolean> {
  return isInterrupted(await app.invoke({}, cfg(threadId)));
}

export async function reply(app: App, threadId: string, answer: string): Promise<string> {
  const r = await app.invoke(new Command({ resume: answer }), cfg(threadId));
  return r.log;
}
