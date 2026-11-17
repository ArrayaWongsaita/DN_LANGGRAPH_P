import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";

const State = new StateSchema({ messages: MessagesValue });

export function buildChatGraph(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("chat", async (state) => {
      const reply = await llm.invoke(state.messages);
      // 👉 ข้อ 1: คืน update ที่ต่อ reply ท้าย messages (reducer จะต่อท้ายให้เอง)
      // แนวทาง: return { messages: [reply] };
      return todo(1);
    })
    .addEdge(START, "chat")
    .addEdge("chat", END)
    .compile();
}

export type ChatGraph = ReturnType<typeof buildChatGraph>;

// ส่งข้อความหนึ่งข้อความเข้า graph แล้วคืน "ข้อความตอบกลับล่าสุด" เป็นสตริง
export async function ask(graph: ChatGraph, text: string): Promise<string> {
  // 👉 ข้อ 2: invoke graph ด้วย { messages: [new HumanMessage(text)] }
  //          แล้วคืน .text ของข้อความสุดท้ายใน result.messages
  return todo(2);
}
