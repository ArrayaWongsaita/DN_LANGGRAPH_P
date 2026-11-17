import { Command, END, INTERRUPT, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  name: z.string().default(""),
  city: z.string().default(""),
});

export function buildForm() {
  return new StateGraph(State)
    .addNode("askName", () => ({ name: interrupt("ชื่ออะไร?") as string }))
    .addNode("askCity", () => ({ city: interrupt("อยู่เมืองไหน?") as string }))
    .addEdge(START, "askName")
    .addEdge(START, "askCity")
    .addEdge("askName", END)
    .addEdge("askCity", END)
    .compile({ checkpointer: new MemorySaver() });
}

type Form = ReturnType<typeof buildForm>;

// ตอบทุกคำถามที่ค้างด้วย answer(คำถาม) แล้วคืนผลสุดท้าย
export async function fillForm(form: Form, answer: (question: string) => string) {
  const cfg = { configurable: { thread_id: "t" } };
  const first = await form.invoke({}, cfg);
  if (!isInterrupted(first)) return first;

  const answers: Record<string, string> = {};
  for (const pending of first[INTERRUPT]) {
    // 👉 ข้อ 1: answers[pending.id!] = answer(String(pending.value))
    todo(1);
  }
  // 👉 ข้อ 2: คืนผลของ form.invoke(new Command({ resume: answers }), cfg)
  return todo(2);
}
