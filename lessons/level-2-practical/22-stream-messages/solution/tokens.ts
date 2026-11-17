import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, START, StateGraph, StateSchema, MessagesValue } from "@langchain/langgraph";

const State = new StateSchema({ messages: MessagesValue });

export function buildTwoStepGraph(llm: BaseChatModel) {
  return new StateGraph(State)
    .addNode("draft", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
    .addNode("polish", async (state) => ({ messages: [await llm.invoke(state.messages)] }))
    .addEdge(START, "draft")
    .addEdge("draft", "polish")
    .addEdge("polish", END)
    .compile();
}

type TwoStep = ReturnType<typeof buildTwoStepGraph>;

export async function collectAll(graph: TwoStep, question: string): Promise<string> {
  let text = "";
  for await (const [chunk] of await graph.stream(
    { messages: [new HumanMessage(question)] },
    { streamMode: "messages" },
  )) {
    text += chunk.text;
  }
  return text;
}

export async function collectFrom(graph: TwoStep, question: string, nodeName: string): Promise<string> {
  let text = "";
  for await (const [chunk, meta] of await graph.stream(
    { messages: [new HumanMessage(question)] },
    { streamMode: "messages" },
  )) {
    if (meta.langgraph_node === nodeName) text += chunk.text;
  }
  return text;
}
