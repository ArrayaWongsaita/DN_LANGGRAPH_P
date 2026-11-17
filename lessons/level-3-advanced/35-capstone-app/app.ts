import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Command, END, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import type { BaseCheckpointSaver, BaseStore } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  question: z.string().default(""),
  lang: z.string().default("th"),
  report: z.string().default(""),
  approved: z.boolean().default(false),
  result: z.string().default(""),
});

export function buildApp(llm: BaseChatModel, saver: BaseCheckpointSaver, store: BaseStore) {
  return new StateGraph(State, { context: z.object({ userId: z.string() }) })
    .addNode("prepare", async (_state, runtime) => {
      // 👉 ข้อ 1: อ่านภาษาที่ชอบ: const item = await runtime.store!.get(["prefs", runtime.context!.userId], "lang");
      //          lang = item?.value.lang ถ้าไม่มีใช้ "th" แล้วคืน { lang }
      // 👉 ข้อ 2: ก่อน return ส่งความคืบหน้า: runtime.writer?.({ stage: "prepare" })
      return todo(1);
    })
    .addNode("draft", async (state, runtime) => {
      runtime.writer?.({ stage: "draft" });
      const reply = await llm.invoke(`เขียนรายงานสั้น ๆ เรื่อง ${state.question} เป็นภาษา ${state.lang}`);
      return { report: reply.text };
    })
    .addNode("approve", (state) => {
      // 👉 ข้อ 3: const ok = interrupt({ report: state.report }); คืน { approved: ok === true }
      return todo(3);
    })
    .addNode("publish", (state) => ({
      result: state.approved ? `เผยแพร่แล้ว: ${state.report}` : "ไม่เผยแพร่",
    }))
    .addEdge(START, "prepare")
    .addEdge("prepare", "draft")
    .addEdge("draft", "approve")
    .addEdge("approve", "publish")
    .addEdge("publish", END)
    // 👉 ข้อ 4: compile พร้อม { checkpointer: saver, store }
    .compile();
}

export type App = ReturnType<typeof buildApp>;
const cfg = (threadId: string, userId: string) => ({ configurable: { thread_id: threadId }, context: { userId } });

// เริ่มงาน: คืนรายงานที่รออนุมัติ (ถ้าหยุดรอ) พร้อมรายชื่อ stage ที่ส่งความคืบหน้า
export async function start(app: App, threadId: string, userId: string, question: string) {
  const stages: string[] = [];
  let report = "";
  for await (const [mode, data] of await app.stream(
    { question },
    { ...cfg(threadId, userId), streamMode: ["custom", "values"] },
  )) {
    if (mode === "custom") stages.push((data as { stage: string }).stage);
    if (mode === "values") report = (data as { report?: string }).report ?? report;
  }
  const state = await app.getState({ configurable: { thread_id: threadId } });
  return { stages, report, waiting: state.next.includes("approve") };
}

// ตัดสินใจอนุมัติ/ไม่ แล้วคืนผลสุดท้าย
export async function decide(app: App, threadId: string, userId: string, approve: boolean): Promise<string> {
  const r = await app.invoke(new Command({ resume: approve }), cfg(threadId, userId));
  return r.result;
}
