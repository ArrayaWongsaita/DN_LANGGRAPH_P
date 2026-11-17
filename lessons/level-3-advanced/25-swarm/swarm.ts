import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Command, END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const Name = z.enum(["alice", "bob"]);

const State = new StateSchema({
  message: z.string().default(""),
  active: Name.default("alice"),
  reply: z.string().default(""),
});

// agent ที่ตอบเป็น { reply, handoffTo? } ถ้า handoffTo ไม่ใช่ตัวเอง ให้ส่งต่อ
function makeAgent(self: "alice" | "bob", other: "alice" | "bob", llm: BaseChatModel) {
  return async (state: { message: string }) => {
    const out = await llm
      .withStructuredOutput(z.object({ reply: z.string(), handoffTo: Name.optional() }))
      .invoke(`คุณคือ ${self} ตอบลูกค้า: ${state.message}`);
    if (out.handoffTo && out.handoffTo !== self) {
      // 👉 ข้อ 2: คืน new Command({ update: { reply: out.reply, active: out.handoffTo }, goto: out.handoffTo })
      return todo(2);
    }
    return { reply: out.reply, active: self };
  };
}

export function buildSwarm(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("alice", makeAgent("alice", "bob", llm), { ends: ["bob"] })
    .addNode("bob", makeAgent("bob", "alice", llm), { ends: ["alice"] })
    .addConditionalEdges(
      START,
      (state) => {
        // 👉 ข้อ 1: เริ่มที่ agent ปัจจุบัน: คืน state.active
        return todo(1);
      },
      ["alice", "bob"],
    )
    .addEdge("alice", END)
    .addEdge("bob", END)
    // 👉 ข้อ 3: compile พร้อม checkpointer: new MemorySaver() (เพื่อให้ active จำข้ามข้อความ)
    .compile();
}

export async function talk(graph: ReturnType<typeof buildSwarm>, text: string): Promise<{ reply: string; active: string }> {
  const r = await graph.invoke({ message: text }, { configurable: { thread_id: "t" } });
  return { reply: r.reply, active: r.active };
}
