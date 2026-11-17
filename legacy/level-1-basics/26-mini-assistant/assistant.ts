import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// โปรเจกต์เล็กของ Level 1: รวมทุกอย่างที่เรียนมา
//   START -> classify -> respond -> format -> END
const State = new StateSchema({
  question: z.string().default(""),
  kind: z.string().default(""),
  answer: z.string().default(""),
});

const PERSONA = {
  short: "คุณคือผู้ช่วยที่ตอบสั้นกระชับ ไม่เกิน 1 ประโยค",
  long: "คุณคือผู้ช่วยที่อธิบายเป็นขั้นตอน ชัดเจน ไม่เกิน 5 ประโยค",
} as const;

export function buildAssistantGraph(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("classify", (s) => ({ kind: s.question.length <= 20 ? "short" : "long" }))
    .addNode("respond", async (s) => {
      const persona = PERSONA[s.kind as keyof typeof PERSONA];
      const res = await llm.invoke([new SystemMessage(persona), new HumanMessage(s.question)]);
      return { answer: res.text };
    })
    .addNode("format", (s) => ({ answer: `${s.answer}\n— ตอบโดยผู้ช่วย LangGraph` }))
    .addEdge(START, "classify")
    .addEdge("classify", "respond")
    .addEdge("respond", "format")
    .addEdge("format", END)
    .compile();
}
