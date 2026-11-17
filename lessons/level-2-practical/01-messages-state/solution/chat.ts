import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";

const State = new StateSchema({ messages: MessagesValue });

export function buildChatGraph(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("chat", async (state) => {
      const reply = await llm.invoke(state.messages);
      return { messages: [reply] };
    })
    .addEdge(START, "chat")
    .addEdge("chat", END)
    .compile();
}

export type ChatGraph = ReturnType<typeof buildChatGraph>;

export async function ask(graph: ChatGraph, text: string): Promise<string> {
  const result = await graph.invoke({ messages: [new HumanMessage(text)] });
  return result.messages[result.messages.length - 1].text;
}
