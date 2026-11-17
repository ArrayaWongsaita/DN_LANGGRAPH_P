import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { type BaseMessage, RemoveMessage } from "@langchain/core/messages";

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

export async function getHistory(graph: Chat, threadId: string): Promise<BaseMessage[]> {
  const snapshot = await graph.getState(cfg(threadId));
  return snapshot.values.messages ?? [];
}

export async function deleteMessage(graph: Chat, threadId: string, index: number): Promise<void> {
  const messages = await getHistory(graph, threadId);
  const target = messages[index];
  await graph.updateState(cfg(threadId), { messages: [new RemoveMessage({ id: target.id! })] });
}
