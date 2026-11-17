import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const State = new StateSchema({
  topic: z.string(),
  draft: z.string().default(""),
  final: z.string().default(""),
});

// เขียนร่าง แล้วให้ LLM อีกรอบปรับปรุง (ผลของขั้นแรกส่งต่อให้ขั้นที่สองผ่าน state)
export function buildDraftGraph(llm: BaseChatModel) {
  const graph = new StateGraph(State)
    .addNode("writeDraft", async (state) => {
      const reply = await llm.invoke(`เขียนย่อหน้าสั้น ๆ เกี่ยวกับ: ${state.topic}`);
      return { draft: reply.text };
    })
    .addNode("improve", async (state) => {
      // 👉 ข้อ 1: ส่งร่าง (state.draft) ให้ LLM ปรับปรุง แล้วเก็บผลลง field "final"
      // แนวทาง: const reply = await llm.invoke(`ปรับปรุงข้อความนี้ให้ดีขึ้น: ${state.draft}`);
      //         return { final: reply.text };
      return todo(1);
    });

  graph.addEdge(START, "writeDraft");

  // 👉 ข้อ 2: ต่อ "writeDraft" ไปที่ "improve"
  todo(2);

  // 👉 ข้อ 3: ต่อ "improve" ไปที่ END
  todo(3);

  return graph.compile();
}
