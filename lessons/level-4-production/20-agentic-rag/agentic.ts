import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { InMemoryIndex } from "@src/rag";
import { todo } from "@src/todo";
import { z } from "zod";

const MAX_REWRITES = 1;

const State = new StateSchema({
  question: z.string().default(""),
  query: z.string().default(""),
  docs: z.string().default(""),
  relevant: z.boolean().default(false),
  rewrites: z.number().default(0),
  answer: z.string().default(""),
});

export function buildAgenticRag(llm: BaseChatModel, index: InMemoryIndex) {
  return new StateGraph(State)
    .addNode("retrieve", async (state) => {
      const query = state.query || state.question;
      const hits = await index.search(query, 1);
      return { query, docs: hits.map((h) => `[${h.source}] ${h.text}`).join("\n") };
    })
    .addNode("grade", async (state) => {
      // 👉 ข้อ 1: verdict = await llm.withStructuredOutput(z.object({ relevant: z.boolean() }))
      //                      .invoke(`คำถาม: ${state.question}\nเอกสาร: ${state.docs}\nเอกสารนี้ตอบคำถามได้ไหม`)
      //          คืน { relevant: verdict.relevant }
      return todo(1);
    })
    .addNode("rewrite", async (state) => {
      const reply = await llm.invoke(`เขียนคำค้นใหม่ให้ตรงศัพท์ในเอกสารมากขึ้น: ${state.question}`);
      return { query: reply.text, rewrites: state.rewrites + 1 };
    })
    .addNode("generate", async (state) => {
      // 👉 ข้อ 3: prompt = `ตอบคำถามจากเอกสารนี้เท่านั้น\nเอกสาร: ${state.docs}\nคำถาม: ${state.question}`
      //          คืน { answer: (await llm.invoke(prompt)).text }
      return todo(3);
    })
    .addNode("giveUp", () => ({ answer: "ไม่พบข้อมูลในเอกสาร" }))
    .addEdge(START, "retrieve")
    .addEdge("retrieve", "grade")
    .addConditionalEdges(
      "grade",
      (state) => {
        // 👉 ข้อ 2: ถ้า state.relevant คืน "generate"; ไม่เกี่ยวและ state.rewrites < MAX_REWRITES คืน "rewrite"; นอกนั้นคืน "giveUp"
        return todo(2);
      },
      ["generate", "rewrite", "giveUp"],
    )
    .addEdge("rewrite", "retrieve")
    .addEdge("generate", END)
    .addEdge("giveUp", END)
    .compile();
}
