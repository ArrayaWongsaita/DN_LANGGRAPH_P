import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const MAX_TOPICS = 4;
const MAX_ROUNDS = 3;

const State = new StateSchema({
  question: z.string().default(""),
  topics: z.array(z.string()).default(() => []),
  notes: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
  report: z.string().default(""),
  feedback: z.string().default(""),
  approved: z.boolean().default(false),
  round: z.number().default(0),
});

export function buildResearch(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("plan", async (state) => {
      const plan = await llm
        .withStructuredOutput(z.object({ topics: z.array(z.string()) }))
        .invoke(`แตกคำถามเป็นหัวข้อย่อย: ${state.question}`);
      return { topics: plan.topics.slice(0, MAX_TOPICS) };
    })
    .addNode("researchTask", async (input: unknown) => {
      const { topic } = input as { topic: string };
      return { notes: (await llm.invoke(`ค้นคว้าหัวข้อ: ${topic}`)).text };
    })
    .addNode("write", async (state) => {
      const prompt =
        `เขียนรายงานตอบ "${state.question}" จากโน้ต: ${state.notes.join("; ")}` +
        (state.feedback ? `\nแก้ตามข้อติ: ${state.feedback}` : "");
      return { report: (await llm.invoke(prompt)).text, round: state.round + 1 };
    })
    .addNode("review", async (state) => {
      const verdict = await llm
        .withStructuredOutput(z.object({ approved: z.boolean(), feedback: z.string() }))
        .invoke(`ตรวจรายงานนี้: ${state.report}`);
      return { approved: verdict.approved, feedback: verdict.feedback };
    })
    .addEdge(START, "plan")
    .addConditionalEdges("plan", (state) => state.topics.map((topic) => new Send("researchTask", { topic })), ["researchTask"])
    .addEdge("researchTask", "write")
    .addEdge("write", "review")
    .addConditionalEdges("review", (state) => (state.approved || state.round >= MAX_ROUNDS ? END : "write"), ["write", END])
    .compile();
}
