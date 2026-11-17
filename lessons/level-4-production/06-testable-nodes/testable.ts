import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  text: z.string().default(""),
  summary: z.string().default(""),
});

// ตรรกะล้วน ๆ (ไม่เรียกโมเดล): ตัดช่องว่างหัวท้าย และยุบช่องว่างซ้อนให้เหลือช่องเดียว
export function cleanText(text: string): string {
  // 👉 ข้อ 2: คืน text.trim().replace(/\s+/g, " ")
  return todo(2);
}

// node ที่รับโมเดลเข้ามา (ไม่ import โมเดลตายตัว)
export function makeSummarizeNode(llm: BaseChatModel) {
  return async (state: { text: string }) => {
    // 👉 ข้อ 1: เรียก llm.invoke(`สรุปสั้น ๆ: ${state.text}`) แล้วคืน { summary: ผล.text }
    return todo(1);
  };
}

export function buildPipeline(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("clean", (state) => ({ text: cleanText(state.text) }))
    // 👉 ข้อ 3: เพิ่ม node "summarize" ด้วย makeSummarizeNode(llm) แล้วต่อ START → clean → summarize → END
    .compile();
}
