import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { type BaseMessage, RemoveMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";

const State = new StateSchema({ messages: MessagesValue });

export function buildChat(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("chat", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
    .addEdge(START, "chat")
    .addEdge("chat", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type Chat = ReturnType<typeof buildChat>;

const cfg = (threadId: string) => ({ configurable: { thread_id: threadId } });

export async function chat(graph: Chat, threadId: string, text: string): Promise<string> {
  const result = await graph.invoke({ messages: [new HumanMessage(text)] }, cfg(threadId));
  return result.messages[result.messages.length - 1].text;
}

// อ่านข้อความทั้งหมดของ thread
export async function getHistory(graph: Chat, threadId: string): Promise<BaseMessage[]> {
  // 👉 ข้อ 1: ใช้ graph.getState(cfg(threadId)) แล้วคืน .values.messages
  //          (thread ที่ยังไม่เคยคุย values จะว่าง messages เป็น undefined ให้คืน [] แทน)
  return todo(1);
}

// ลบข้อความลำดับที่ index (นับจาก 0) ออกจาก thread
export async function deleteMessage(graph: Chat, threadId: string, index: number): Promise<void> {
  const messages = await getHistory(graph, threadId);
  const target = messages[index];
  // 👉 ข้อ 2: เรียก graph.updateState(cfg(threadId), { messages: [new RemoveMessage({ id: target.id! })] })
  todo(2);
}
