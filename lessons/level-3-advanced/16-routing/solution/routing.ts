import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const Category = z.enum(["billing", "tech", "other"]);

const State = new StateSchema({
  question: z.string().default(""),
  category: Category.optional(),
  answer: z.string().default(""),
});

export function buildRouter(llm: BaseChatModel) {
  const expert = (role: string) => async (state: { question: string }) => ({
    answer: (await llm.invoke(`คุณคือ${role} ตอบ: ${state.question}`)).text,
  });
  return new StateGraph(State)
    .addNode("classify", async (state) => {
      const result = await llm
        .withStructuredOutput(z.object({ category: Category }))
        .invoke(`จัดประเภทคำถาม (billing/tech/other): ${state.question}`);
      return { category: result.category };
    })
    .addNode("billing", expert("เจ้าหน้าที่การเงิน"))
    .addNode("tech", expert("ช่างเทคนิค"))
    .addNode("other", expert("ผู้ช่วยทั่วไป"))
    .addEdge(START, "classify")
    .addConditionalEdges("classify", (state) => state.category ?? "other", ["billing", "tech", "other"])
    .addEdge("billing", END)
    .addEdge("tech", END)
    .addEdge("other", END)
    .compile();
}
