import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

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
      // 👉 ข้อ 1: ใช้ llm.withStructuredOutput(z.object({ category: Category })) เรียก invoke ด้วย
      //          `จัดประเภทคำถาม (billing/tech/other): ${state.question}` แล้วคืน { category: ผล.category }
      return todo(1);
    })
    .addNode("billing", expert("เจ้าหน้าที่การเงิน"))
    .addNode("tech", expert("ช่างเทคนิค"))
    .addNode("other", expert("ผู้ช่วยทั่วไป"))
    .addEdge(START, "classify")
    .addConditionalEdges(
      "classify",
      (state) => {
        // 👉 ข้อ 2: คืน state.category (ถ้าไม่มีให้คืน "other")
        return todo(2);
      },
      ["billing", "tech", "other"],
    )
    .addEdge("billing", END)
    .addEdge("tech", END)
    .addEdge("other", END)
    .compile();
}
