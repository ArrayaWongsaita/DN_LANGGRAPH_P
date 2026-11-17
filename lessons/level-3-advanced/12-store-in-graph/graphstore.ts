import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { BaseStore } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  text: z.string().default(""),
  reply: z.string().default(""),
});

export function buildMemoryGraph(store: BaseStore) {
  return new StateGraph(State, { context: z.object({ userId: z.string() }) })
    .addNode("respond", async (state, runtime) => {
      const userId = runtime.context!.userId;
      const ns = ["profiles", userId];
      if (state.text.startsWith("จำชื่อ:")) {
        const name = state.text.slice("จำชื่อ:".length).trim();
        // 👉 ข้อ 1: เก็บชื่อ: await runtime.store!.put(ns, "name", { name })
        todo(1);
        return { reply: `ยินดีที่รู้จัก ${name}` };
      }
      // 👉 ข้อ 2: อ่านชื่อ: const item = await runtime.store!.get(ns, "name"); ถ้าไม่มีตอบ "ยังไม่รู้จักชื่อคุณ"
      //          ถ้ามีตอบ `คุณชื่อ ${item.value.name}`  (ใส่ผลใน reply)
      return todo(2);
    })
    .addEdge(START, "respond")
    .addEdge("respond", END)
    .compile({ store });
}

export type MemoryGraph = ReturnType<typeof buildMemoryGraph>;

export async function say(graph: MemoryGraph, userId: string, text: string): Promise<string> {
  const r = await graph.invoke({ text }, { context: { userId } });
  return r.reply;
}
