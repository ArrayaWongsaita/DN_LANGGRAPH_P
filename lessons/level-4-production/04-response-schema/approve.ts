import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const Decision = z.object({ approved: z.boolean(), note: z.string().default("") });

const State = new StateSchema({ result: z.string().default("") });

export function buildApprovalApp() {
  return new StateGraph(State)
    .addNode("decide", () => {
      // 👉 ข้อ 1: const answer = interrupt({ question: "อนุมัติไหม?" }, { responseSchema: Decision } as never);
      //          (บางเวอร์ชันของ type ยังไม่มี option นี้ จึงใส่ as never) แล้วคืน { result: JSON.stringify(answer) }
      return todo(1);
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
    // 👉 ข้อ 2: const r = await app.invoke(new Command({ resume: value }), cfg(threadId)); แล้วคืน { ok: true, result: r.result }
    return todo(2);
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}
