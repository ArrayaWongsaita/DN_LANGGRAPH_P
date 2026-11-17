import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";

export function makeAnswerSchema() {
  return z.object({ city: z.string(), tempC: z.number(), summary: z.string() });
}

export function buildFinalGraph(llm: BaseChatModel, tools: StructuredToolInterface[]) {
  const AnswerSchema = makeAnswerSchema();
  const State = new StateSchema({ messages: MessagesValue, answer: AnswerSchema.optional() });
  const llmWithTools = llm.bindTools!(tools);
  return new StateGraph(State)
    .addNode("agent", async (state) => ({ messages: [await llmWithTools.invoke(state.messages)] }))
    .addNode("tools", new ToolNode(tools))
    .addNode("format", async (state) => {
      const answer = await llm.withStructuredOutput(AnswerSchema).invoke(state.messages);
      return { answer };
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
