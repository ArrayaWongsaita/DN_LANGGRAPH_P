import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

export interface Checkers {
  safety: BaseChatModel;
  tone: BaseChatModel;
  length: BaseChatModel;
}

const State = new StateSchema({
  text: z.string().default(""),
  safety: z.string().default(""),
  tone: z.string().default(""),
  length: z.string().default(""),
  report: z.string().default(""),
});

export function buildParallel(c: Checkers) {
  const builder = new StateGraph(State)
    .addNode("checkSafety", async (s) => ({ safety: (await c.safety.invoke(`ตรวจความปลอดภัย: ${s.text}`)).text }))
    .addNode("checkTone", async (s) => ({ tone: (await c.tone.invoke(`ตรวจน้ำเสียง: ${s.text}`)).text }))
    .addNode("checkLength", async (s) => ({ length: (await c.length.invoke(`ตรวจความยาว: ${s.text}`)).text }))
    .addNode("makeReport", (s) => {
      // 👉 ข้อ 2: คืน { report: `${s.safety} | ${s.tone} | ${s.length}` }
      return todo(2);
    });
  // 👉 ข้อ 1: เพิ่ม edge จาก START ไปทั้ง 3 node ตรวจ และจากทั้ง 3 node ไป "makeReport" (ใช้ builder.addEdge หลายครั้ง)
  todo(1);
  return builder.addEdge("makeReport", END).compile();
}
