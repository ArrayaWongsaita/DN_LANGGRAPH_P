import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { todo } from "@src/todo";
import { z } from "zod";

export function makeAnswerSchema() {
  // 👉 ข้อ 1: schema { city: string, tempC: number, summary: string }
  return todo(1);
}

export function buildFinalGraph(llm: BaseChatModel, tools: StructuredToolInterface[]) {
  const AnswerSchema = makeAnswerSchema();
  const State = new StateSchema({ messages: MessagesValue, answer: AnswerSchema.optional() });
  const llmWithTools = llm.bindTools!(tools);
  return new StateGraph(State)
    .addNode("agent", async (state) => ({ messages: [await llmWithTools.invoke(state.messages)] }))
    .addNode("tools", new ToolNode(tools))
    .addNode("format", async (state) => {
      // 👉 ข้อ 2: ใช้ llm.withStructuredOutput(AnswerSchema) เรียก .invoke(state.messages)
      //          แล้วคืน { answer: ผลที่ได้ }
      return todo(2);
    })
    .addEdge(START, "agent")
    .addConditionalEdges(
      "agent",
      (state) => {
        const last = state.messages[state.messages.length - 1];
        return "tool_calls" in last && Array.isArray(last.tool_calls) && last.tool_calls.length > 0
          ? "tools"
          : "format";
      },
      ["tools", "format"],
    )
    .addEdge("tools", "agent")
    .addEdge("format", END)
    .compile();
}
