import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { END, START, StateGraph, StateSchema, MessagesValue } from "@langchain/langgraph";
import { todo } from "@src/todo";

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

// คืนข้อความทั้งหมดที่ LLM ผลิต "ทุก node" ต่อกัน
export async function collectAll(graph: TwoStep, question: string): Promise<string> {
  let text = "";
  // 👉 ข้อ 1: วน for await ... of await graph.stream({ messages: [new HumanMessage(question)] }, { streamMode: "messages" })
  //          แต่ละรอบได้ [chunk, meta] ให้ต่อ chunk.text เข้า text
  return todo(1);
}

// คืนเฉพาะข้อความที่มาจาก node ชื่อ nodeName
export async function collectFrom(graph: TwoStep, question: string, nodeName: string): Promise<string> {
  let text = "";
  // 👉 ข้อ 2: เหมือนข้อ 1 แต่ต่อ chunk.text เฉพาะเมื่อ meta.langgraph_node === nodeName
  return todo(2);
}
