import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { trimMessages } from "@langchain/core/messages";

const State = new StateSchema({ messages: MessagesValue });

export function buildTrimmedChat(llm: BaseChatModel, keep: number) {
  return new StateGraph(State)
    .addNode("chat", async (state) => {
      const recent = await trimMessages(state.messages, {
        maxTokens: keep,
        strategy: "last",
        tokenCounter: (msgs) => msgs.length,
        startOn: "human",
      });
      return { messages: [await llm.invoke(recent)] };
    })
    .addEdge(START, "chat")
    .addEdge("chat", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type TrimmedChat = ReturnType<typeof buildTrimmedChat>;

export async function chat(graph: TrimmedChat, text: string) {
  return graph.invoke({ messages: [new HumanMessage(text)] }, { configurable: { thread_id: "t" } });
}
