import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { z } from "zod";

const Decision = z.object({ approved: z.boolean(), note: z.string().default("") });

const State = new StateSchema({ result: z.string().default("") });

export function buildApprovalApp() {
  return new StateGraph(State)
    .addNode("decide", () => {
      const answer = interrupt({ question: "อนุมัติไหม?" }, { responseSchema: Decision } as never);
      return { result: JSON.stringify(answer) };
    })
    .addEdge(START, "decide")
    .addEdge("decide", END)
    .compile({ checkpointer: new MemorySaver() });
}

type App = ReturnType<typeof buildApprovalApp>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

export async function begin(app: App, threadId: string): Promise<void> {
  await app.invoke({}, cfg(threadId));
}

export type Reply = { ok: true; result: string } | { ok: false; message: string };

export async function reply(app: App, threadId: string, value: unknown): Promise<Reply> {
  try {
    const r = await app.invoke(new Command({ resume: value }), cfg(threadId));
    return { ok: true, result: r.result };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}
