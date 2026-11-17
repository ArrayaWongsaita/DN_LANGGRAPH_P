import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
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

// ประกอบ thread_id จากผู้ใช้และหัวข้อ เช่น makeThreadId("mali", "งาน") => "mali:งาน"
export function makeThreadId(user: string, topic: string): string {
  // 👉 ข้อ 1: คืน `${user}:${topic}`
  return todo(1);
}

export async function chat(graph: Chat, threadId: string, text: string): Promise<string> {
  // 👉 ข้อ 2: invoke ด้วย { messages: [new HumanMessage(text)] } และ config ที่ระบุ thread_id
  //          แนวทาง: { configurable: { thread_id: threadId } } แล้วคืน .text ของข้อความสุดท้าย
  return todo(2);
}
