import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseCheckpointSaver } from "@langchain/langgraph";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { InMemoryIndex } from "@src/rag";
import { todo } from "@src/todo";
import { z } from "zod";

export const BANNED = ["เจาะระบบ", "สร้างอาวุธ"];
export const REFUSAL = "ขออภัย ช่วยเรื่องนี้ไม่ได้";
export const NOT_FOUND = "ไม่พบข้อมูลในเอกสาร";

const Cited = z.object({ answer: z.string(), sources: z.array(z.string()) });

const State = new StateSchema({
  question: z.string().default(""),
  blocked: z.boolean().default(false),
  hits: z.array(z.object({ source: z.string(), text: z.string(), score: z.number() })).default(() => []),
  answer: z.string().default(""),
  sources: z.array(z.string()).default(() => []),
});

export function buildAssistant(llm: BaseChatModel, index: InMemoryIndex, checkpointer: BaseCheckpointSaver) {
  return new StateGraph(State)
    .addNode("guard", (state) => {
      // 👉 ข้อ 1: ถ้า state.question มีคำใดใน BANNED คืน { blocked: true, answer: REFUSAL } ไม่เช่นนั้นคืน { blocked: false }
      return todo(1);
    })
    .addNode("retrieve", async (state) => {
      const hits = (await index.search(state.question, 2)).filter((h) => h.score > 0);
      return { hits };
    })
    .addNode("respond", async (state) => {
      const context = state.hits.map((h) => `[${h.source}] ${h.text}`).join("\n");
      const result = await llm
        .withStructuredOutput(Cited)
        .invoke(`ตอบจากเอกสารเท่านั้นและระบุไฟล์ที่ใช้ใน sources\n${context}\nคำถาม: ${state.question}`);
      // 👉 ข้อ 3: กรอง result.sources ให้เหลือเฉพาะที่อยู่ใน state.hits จริง
      //          ถ้าเหลืออย่างน้อยหนึ่งแหล่ง คืน { answer: result.answer, sources: แหล่งที่กรองแล้ว } ไม่เช่นนั้นคืน { answer: NOT_FOUND, sources: [] }
      return todo(3);
    })
    .addNode("notFound", () => ({ answer: NOT_FOUND, sources: [] }))
    .addEdge(START, "guard")
    .addConditionalEdges(
      "guard",
      (state) => {
        // 👉 ข้อ 2: ถ้า state.blocked คืน "end"; ไม่เช่นนั้นคืน "retrieve"
        return todo(2);
      },
      { end: END, retrieve: "retrieve" },
    )
    .addConditionalEdges("retrieve", (state) => (state.hits.length > 0 ? "respond" : "notFound"), ["respond", "notFound"])
    .addEdge("respond", END)
    .addEdge("notFound", END)
    .compile({ checkpointer });
}
