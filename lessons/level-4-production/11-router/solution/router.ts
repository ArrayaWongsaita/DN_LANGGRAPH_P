import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

export const SOURCES = ["hr", "it", "general"] as const;

const State = new StateSchema({
  question: z.string().default(""),
  sources: z.array(z.string()).default(() => []),
  answers: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
  final: z.string().default(""),
});

export function buildRouter(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("classify", async (state) => {
      const pick = await llm
        .withStructuredOutput(z.object({ sources: z.array(z.enum(SOURCES)) }))
        .invoke(`เลือกแหล่งความรู้ที่เกี่ยวกับคำถามนี้ (hr/it/general): ${state.question}`);
      return { sources: pick.sources };
    })
    .addNode("ask", async (input: unknown) => {
      const { source, question } = input as { source: string; question: string };
      return { answers: `[${source}] ${(await llm.invoke(`ตอบจากแหล่ง ${source}: ${question}`)).text}` };
    })
    .addNode("synthesize", async (state) => {
      const prompt = `คำถาม: ${state.question}\nคำตอบจากแต่ละแหล่ง:\n${state.answers.join("\n")}\nรวมเป็นคำตอบเดียว`;
      return { final: (await llm.invoke(prompt)).text };
    })
    .addEdge(START, "classify")
    .addConditionalEdges(
      "classify",
      (state) => {
        const sources = state.sources.length > 0 ? state.sources : ["general"];
        return sources.map((source) => new Send("ask", { source, question: state.question }));
      },
      ["ask"],
    )
    .addEdge("ask", "synthesize")
    .addEdge("synthesize", END)
    .compile();
}
