import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";

const State = new StateSchema({ messages: MessagesValue });

export function buildMemoryChat(llm: BaseChatModel) {
  const builder = new StateGraph(State)
    .addNode("chat", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
    .addEdge(START, "chat")
    .addEdge("chat", END);
  return builder.compile({ checkpointer: new MemorySaver() });
}

export type MemoryChat = ReturnType<typeof buildMemoryChat>;

export async function chat(graph: MemoryChat, text: string): Promise<string> {
  const result = await graph.invoke(
    { messages: [new HumanMessage(text)] },
    { configurable: { thread_id: "default" } },
  );
  return result.messages[result.messages.length - 1].text;
}
