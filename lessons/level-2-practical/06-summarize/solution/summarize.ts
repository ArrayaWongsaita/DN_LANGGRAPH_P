import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, MemorySaver, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { RemoveMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";

const State = new StateSchema({
  messages: MessagesValue,
  summary: z.string().default(""),
});

const MAX_MESSAGES = 4;
const KEEP_LAST = 2;

export function buildSummarizingChat(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("chat", async (state) => {
      const head = state.summary ? [new SystemMessage(`สรุปบทสนทนาก่อนหน้า: ${state.summary}`)] : [];
      return { messages: [await llm.invoke([...head, ...state.messages])] };
    })
    .addNode("summarize", async (state) => {
      const reply = await llm.invoke([...state.messages, new HumanMessage("สรุปบทสนทนาข้างต้นสั้น ๆ")]);
      const summaryText: string = reply.text;
      const removals = state.messages.slice(0, -KEEP_LAST).map((m) => new RemoveMessage({ id: m.id! }));
      return { summary: summaryText, messages: removals };
    })
    .addEdge(START, "chat")
    .addConditionalEdges(
      "chat",
      (state) => (state.messages.length > MAX_MESSAGES ? "summarize" : END),
      ["summarize", END],
    )
    .addEdge("summarize", END)
    .compile({ checkpointer: new MemorySaver() });
}

export type SummarizingChat = ReturnType<typeof buildSummarizingChat>;

export async function chat(graph: SummarizingChat, text: string) {
  return graph.invoke({ messages: [new HumanMessage(text)] }, { configurable: { thread_id: "t" } });
}
