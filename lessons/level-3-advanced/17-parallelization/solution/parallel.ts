import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

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
    .addNode("makeReport", (s) => ({ report: `${s.safety} | ${s.tone} | ${s.length}` }));
  for (const name of ["checkSafety", "checkTone", "checkLength"] as const) {
    builder.addEdge(START, name);
    builder.addEdge(name, "makeReport");
  }
  return builder.addEdge("makeReport", END).compile();
}
