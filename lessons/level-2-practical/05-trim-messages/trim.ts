import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { trimMessages } from "@langchain/core/messages";
import { todo } from "@src/todo";

const State = new StateSchema({ messages: MessagesValue });

// keep = จำนวนข้อความล่าสุดสูงสุดที่ส่งให้ LLM
export function buildTrimmedChat(llm: BaseChatModel, keep: number) {
  return new StateGraph(State)
    .addNode("chat", async (state) => {
      // 👉 ข้อ 1: ตัด state.messages ด้วย trimMessages (maxTokens: keep, strategy: "last",
      //          tokenCounter: (msgs) => msgs.length, startOn: "human")
      const recent = todo(1);
      // 👉 ข้อ 2: ส่ง recent (ไม่ใช่ state.messages) ให้ llm.invoke แล้วคืนคำตอบเข้า messages
      return todo(2);
    })
    .addEdge(START, "chat")
    .addEdge("chat", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type TrimmedChat = ReturnType<typeof buildTrimmedChat>;

export async function chat(graph: TrimmedChat, text: string) {
  return graph.invoke({ messages: [new HumanMessage(text)] }, { configurable: { thread_id: "t" } });
}
