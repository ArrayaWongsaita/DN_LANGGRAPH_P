import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";

const State = new StateSchema({ messages: MessagesValue });

export function buildMemoryChat(llm: BaseChatModel) {
  const builder = new StateGraph(State)
    .addNode("chat", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
    .addEdge(START, "chat")
    .addEdge("chat", END);
  // 👉 ข้อ 1: compile พร้อม checkpointer แบบ MemorySaver
  // แนวทาง: return builder.compile({ checkpointer: new MemorySaver() });
  return todo(1);
}

export type MemoryChat = ReturnType<typeof buildMemoryChat>;

// thread_id ยังเป็นค่าคงที่ (บท 2-03 จะสอนการใช้หลาย thread)
export async function chat(graph: MemoryChat, text: string): Promise<string> {
  const result = await graph.invoke(
    { messages: [new HumanMessage(text)] },
    { configurable: { thread_id: "default" } },
  );
  return result.messages[result.messages.length - 1].text;
}
