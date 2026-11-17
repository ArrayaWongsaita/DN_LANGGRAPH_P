import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Command, END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const Name = z.enum(["alice", "bob"]);

const State = new StateSchema({
  message: z.string().default(""),
  active: Name.default("alice"),
  reply: z.string().default(""),
});

function makeAgent(self: "alice" | "bob", other: "alice" | "bob", llm: BaseChatModel) {
  return async (state: { message: string }) => {
    const out = await llm
      .withStructuredOutput(z.object({ reply: z.string(), handoffTo: Name.optional() }))
      .invoke(`คุณคือ ${self} ตอบลูกค้า: ${state.message}`);
    if (out.handoffTo && out.handoffTo !== self) {
      return new Command({ update: { reply: out.reply, active: out.handoffTo }, goto: out.handoffTo });
    }
    return { reply: out.reply, active: self };
  };
}

export function buildSwarm(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("alice", makeAgent("alice", "bob", llm), { ends: ["bob"] })
    .addNode("bob", makeAgent("bob", "alice", llm), { ends: ["alice"] })
    .addConditionalEdges(START, (state) => state.active, ["alice", "bob"])
    .addEdge("alice", END)
    .addEdge("bob", END)
    .compile({ checkpointer: new MemorySaver() });
}

export async function talk(graph: ReturnType<typeof buildSwarm>, text: string): Promise<{ reply: string; active: string }> {
  const r = await graph.invoke({ message: text }, { configurable: { thread_id: "t" } });
  return { reply: r.reply, active: r.active };
}
