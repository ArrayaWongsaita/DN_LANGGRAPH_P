import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

const State = new StateSchema({
  topic: z.string().default(""),
  draft: z.string().default(""),
  final: z.string().default(""),
});

export function buildReviewGraph(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("write", async (state) => ({
      draft: (await llm.invoke(`ร่างอีเมลสั้น ๆ เรื่อง ${state.topic}`)).text,
    }))
    .addNode("review", (state) => {
      const edited = interrupt({ draft: state.draft });
      return { final: typeof edited === "string" && edited !== "" ? edited : state.draft };
    })
    .addEdge(START, "write")
    .addEdge("write", "review")
    .addEdge("review", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type ReviewGraph = ReturnType<typeof buildReviewGraph>;
const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

export async function startReview(graph: ReviewGraph, threadId: string, topic: string): Promise<string> {
  const r = await graph.invoke({ topic }, cfg(threadId));
  const pending = (r as { __interrupt__?: { value: { draft: string } }[] }).__interrupt__;
  return pending![0].value.draft;
}

export async function submitReview(graph: ReviewGraph, threadId: string, edited: string): Promise<string> {
  const r = await graph.invoke(new Command({ resume: edited }), cfg(threadId));
  return r.final;
}

export async function acceptDraft(graph: ReviewGraph, threadId: string): Promise<string> {
  return submitReview(graph, threadId, "");
}
