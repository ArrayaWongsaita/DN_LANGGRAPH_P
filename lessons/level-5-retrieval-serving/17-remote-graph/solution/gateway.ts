import { createHash } from "node:crypto";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { BaseCheckpointSaver, LangGraphRunnableConfig } from "@langchain/langgraph";
import { z } from "zod";

export interface RemoteLike {
  invoke(input: Record<string, unknown>, config?: { configurable?: Record<string, unknown> }): Promise<Record<string, unknown>>;
}

const State = new StateSchema({
  question: z.string().default(""),
  secret: z.string().default(""),
  answer: z.string().default(""),
  source: z.string().default(""),
  error: z.string().default(""),
});
type S = typeof State.State;

export function toRemoteInput(state: Pick<S, "question">): Record<string, unknown> {
  return { question: state.question };
}

export function remoteThreadId(parentThreadId: unknown): string | undefined {
  if (typeof parentThreadId !== "string" || parentThreadId === "") return undefined;
  const h = createHash("sha256").update(`remote:${parentThreadId}`).digest("hex");
  const v = ((Number.parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${v}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export function fromRemoteOutput(out: Record<string, unknown>): Partial<S> {
  if (typeof out.answer !== "string" || out.answer === "") throw new Error("ปลายทางไม่ส่ง answer ที่ใช้ได้");
  return { answer: out.answer, source: "remote", error: "" };
}

export async function askRemote(remote: RemoteLike, state: S, config?: LangGraphRunnableConfig): Promise<Partial<S>> {
  const threadId = remoteThreadId(config?.configurable?.thread_id);
  try {
    const out = await remote.invoke(toRemoteInput(state), threadId ? { configurable: { thread_id: threadId } } : undefined);
    return fromRemoteOutput(out);
  } catch (error) {
    return { answer: "ขออภัย ระบบปลายทางไม่พร้อมให้บริการ", source: "fallback", error: error instanceof Error ? error.message : String(error) };
  }
}

export function buildGateway(remote: RemoteLike, checkpointer?: BaseCheckpointSaver) {
  return new StateGraph(State)
    .addNode("ask", (state, config) => askRemote(remote, state, config))
    .addEdge(START, "ask")
    .addEdge("ask", END)
    .compile(checkpointer ? { checkpointer } : undefined);
}
