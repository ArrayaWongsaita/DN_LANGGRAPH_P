import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  topic: z.string(),
  draft: z.string().default(""),
  final: z.string().default(""),
});

export function buildDraftGraph(llm: BaseChatModel) {
  const graph = new StateGraph(State)
    .addNode("writeDraft", async (state) => {
      const reply = await llm.invoke(`เขียนย่อหน้าสั้น ๆ เกี่ยวกับ: ${state.topic}`);
      return { draft: reply.text };
    })
    .addNode("improve", async (state) => {
      const reply = await llm.invoke(`ปรับปรุงข้อความนี้ให้ดีขึ้น: ${state.draft}`);
      return { final: reply.text };
    });

  graph.addEdge(START, "writeDraft");
  graph.addEdge("writeDraft", "improve");
  graph.addEdge("improve", END);

  return graph.compile();
}
