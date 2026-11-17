import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
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
      // 👉 ข้อ 1: ใช้ llm.withStructuredOutput(z.object({ topics: z.array(z.string()) })) invoke ด้วย
      //          `แตกคำถามเป็นหัวข้อย่อย: ${state.question}` แล้วคืน { topics: ผล.topics.slice(0, MAX_TOPICS) }
      return todo(1);
    })
    .addNode("researchTask", async (input: unknown) => {
      const { topic } = input as { topic: string };
      return { notes: (await llm.invoke(`ค้นคว้าหัวข้อ: ${topic}`)).text };
    })
    .addNode("write", async (state) => {
      // 👉 ข้อ 3: prompt = `เขียนรายงานตอบ "${state.question}" จากโน้ต: ${state.notes.join("; ")}`
      //          ถ้ามี state.feedback ต่อท้ายด้วย `\nแก้ตามข้อติ: ${state.feedback}`
      //          เรียก llm.invoke(prompt) แล้วคืน { report: .text, round: state.round + 1 }
      return todo(3);
    })
    .addNode("review", async (state) => {
      const verdict = await llm
        .withStructuredOutput(z.object({ approved: z.boolean(), feedback: z.string() }))
        .invoke(`ตรวจรายงานนี้: ${state.report}`);
      return { approved: verdict.approved, feedback: verdict.feedback };
    })
    .addEdge(START, "plan")
    .addConditionalEdges(
      "plan",
      (state) => {
        // 👉 ข้อ 2: คืนรายการ Send หนึ่งอันต่อหนึ่งหัวข้อ: new Send("researchTask", { topic })
        return todo(2);
      },
      ["researchTask"],
    )
    .addEdge("researchTask", "write")
    .addEdge("write", "review")
    .addConditionalEdges(
      "review",
      (state) => {
        // 👉 ข้อ 4: คืน END ถ้า state.approved หรือ state.round >= MAX_ROUNDS ไม่เช่นนั้นคืน "write"
        return todo(4);
      },
      ["write", END],
    )
    .compile();
}
