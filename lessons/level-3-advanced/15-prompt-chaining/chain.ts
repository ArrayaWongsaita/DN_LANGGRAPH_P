import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const State = new StateSchema({
  topic: z.string().default(""),
  draft: z.string().default(""),
  final: z.string().default(""),
});

export function buildChain(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("write", async (state) => {
      // 👉 ข้อ 1: เรียก llm.invoke(`เขียนย่อหน้าเกี่ยวกับ ${state.topic}`) แล้วคืน { draft: ข้อความตอบ (.text) }
      return todo(1);
    })
    .addNode("polish", async (state) => {
      // 👉 ข้อ 3: เรียก llm.invoke(`ขัดเกลาข้อความนี้ให้สละสลวย: ${state.draft}`) แล้วคืน { final: .text }
      return todo(3);
    })
    .addNode("tooShort", () => ({ final: "ร่างสั้นเกินไป" }))
    .addEdge(START, "write")
    .addConditionalEdges(
      "write",
      (state) => {
        // 👉 ข้อ 2 (ด่านตรวจ): คืน "polish" ถ้า state.draft ยาวอย่างน้อย 10 ตัวอักษร ไม่เช่นนั้นคืน "tooShort"
        return todo(2);
      },
      ["polish", "tooShort"],
    )
    .addEdge("polish", END)
    .addEdge("tooShort", END)
    .compile();
}
