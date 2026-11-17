import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { todo } from "@src/todo";

const State = new StateSchema({ messages: MessagesValue });

export function makeSaver(path: string): SqliteSaver {
  // 👉 ข้อ 1: คืน SqliteSaver ที่เก็บลงไฟล์ path
  // แนวทาง: return SqliteSaver.fromConnString(path);
  return todo(1);
}

export function buildPersistentChat(llm: BaseChatModel, saver: SqliteSaver) {
  const builder = new StateGraph(State)
    .addNode("chat", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
    .addEdge(START, "chat")
    .addEdge("chat", END);
  // 👉 ข้อ 2: compile พร้อม checkpointer: saver
  return todo(2);
}

export type PersistentChat = ReturnType<typeof buildPersistentChat>;

export async function chat(graph: PersistentChat, text: string): Promise<string> {
  const result = await graph.invoke(
    { messages: [new HumanMessage(text)] },
    { configurable: { thread_id: "user-1" } },
  );
  return result.messages[result.messages.length - 1].text;
}
