import { createHash } from "node:crypto";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { BaseCheckpointSaver, LangGraphRunnableConfig } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

// ส่วนย่อยของ RemoteGraph ที่ใช้ (ตัวจริงใช้แทนได้)
export interface RemoteLike {
  invoke(input: Record<string, unknown>, config?: { configurable?: Record<string, unknown> }): Promise<Record<string, unknown>>;
}

const State = new StateSchema({
  question: z.string().default(""),
  secret: z.string().default(""), // ข้อมูลของกราฟแม่ที่ห้ามส่งไปปลายทาง
  answer: z.string().default(""),
  source: z.string().default(""), // "remote" หรือ "fallback"
  error: z.string().default(""),
});
type S = typeof State.State;

export function toRemoteInput(state: Pick<S, "question">): Record<string, unknown> {
  // 👉 ข้อ 1: คืน { question: state.question } เท่านั้น (ห้ามส่งฟิลด์อื่นของกราฟแม่)
  return todo(1);
}

// thread ฝั่งปลายทางที่อิงจาก thread ของกราฟแม่ (undefined = ไม่มี thread ต่อเนื่อง)
export function remoteThreadId(parentThreadId: unknown): string | undefined {
  // 👉 ข้อ 2: เซิร์ฟเวอร์รับ thread_id ที่เป็น UUID เท่านั้น (ส่ง "remote-abc" ได้ HTTP 400 Invalid uuid เจอตอนรันจริง)
  //   จึงต้องสร้าง UUID ที่ "คงที่" จาก thread ของแม่: parentThreadId ไม่ใช่สตริงไม่ว่าง → undefined
  //   ไม่งั้น h = createHash("sha256").update(`remote:${parentThreadId}`).digest("hex") แล้วคืน
  //   `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${v}${h.slice(17, 20)}-${h.slice(20, 32)}`
  //   โดย v = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16) (ตัวแรกของกลุ่มที่ 4 ต้องเป็น 8, 9, a หรือ b)
  return todo(2);
}

export function fromRemoteOutput(out: Record<string, unknown>): Partial<S> {
  // 👉 ข้อ 3: ถ้า out.answer ไม่ใช่สตริงที่ไม่ว่าง ให้ throw new Error("ปลายทางไม่ส่ง answer ที่ใช้ได้")
  //          ไม่งั้นคืน { answer: out.answer, source: "remote", error: "" }
  return todo(3);
}

export async function askRemote(remote: RemoteLike, state: S, config?: LangGraphRunnableConfig): Promise<Partial<S>> {
  // 👉 ข้อ 4: threadId = remoteThreadId(config?.configurable?.thread_id)
  //   try: out = await remote.invoke(toRemoteInput(state), threadId ? { configurable: { thread_id: threadId } } : undefined)
  //        แล้วคืน fromRemoteOutput(out)
  //   catch: คืน { answer: "ขออภัย ระบบปลายทางไม่พร้อมให้บริการ", source: "fallback", error: ข้อความของ error }
  return todo(4);
}

// (ให้ไว้แล้ว) กราฟแม่: ask (เรียกปลายทางผ่าน adapter) → END
export function buildGateway(remote: RemoteLike, checkpointer?: BaseCheckpointSaver) {
  return new StateGraph(State)
    .addNode("ask", (state, config) => askRemote(remote, state, config))
    .addEdge(START, "ask")
    .addEdge("ask", END)
    .compile(checkpointer ? { checkpointer } : undefined);
}
