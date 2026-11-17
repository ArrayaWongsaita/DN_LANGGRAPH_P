import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  question: z.string(),
  category: z.string().default(""),
  answer: z.string().default(""),
});
type AssistantState = typeof State.State;

const categorySchema = z.object({ category: z.enum(["greeting", "question"]) });

export function pickRoute(state: Pick<AssistantState, "category">): "smallTalk" | "respond" {
  return state.category === "greeting" ? "smallTalk" : "respond";
}

export function buildAssistantGraph(llm: BaseChatModel) {
  const graph = new StateGraph(State)
    .addNode("classify", async (state) => {
      const classifier = llm.withStructuredOutput(categorySchema);
      const result = await classifier.invoke(`จัดประเภทข้อความนี้: ${state.question}`);
      return { category: result.category };
    })
    .addNode("smallTalk", () => ({ answer: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ" }))
    .addNode("respond", async (state) => {
      const reply = await llm.invoke(state.question);
      return { answer: reply.text };
    });

  graph.addEdge(START, "classify");
  graph.addConditionalEdges("classify", pickRoute, ["smallTalk", "respond"]);
  graph.addEdge("smallTalk", END);
  graph.addEdge("respond", END);

  return graph.compile();
}
