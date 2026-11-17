import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";

const State = new StateSchema({ messages: MessagesValue });

export function buildChat(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("chat", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
    .addEdge(START, "chat")
    .addEdge("chat", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type Chat = ReturnType<typeof buildChat>;

export function makeThreadId(user: string, topic: string): string {
  return `${user}:${topic}`;
}

export async function chat(graph: Chat, threadId: string, text: string): Promise<string> {
  const result = await graph.invoke(
    { messages: [new HumanMessage(text)] },
    { configurable: { thread_id: threadId } },
  );
  return result.messages[result.messages.length - 1].text;
}
