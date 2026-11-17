import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";

const State = new StateSchema({ messages: MessagesValue });

export function buildAgent(llm: BaseChatModel, tools: StructuredToolInterface[]) {
  const llmWithTools = llm.bindTools!(tools);
  return new StateGraph(State)
    .addNode("agent", async (state) => ({ messages: [await llmWithTools.invoke(state.messages)] }))
    .addNode("tools", new ToolNode(tools))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", toolsCondition, ["tools", END])
    .addEdge("tools", "agent")
    .compile();
}

export async function runAgent(graph: ReturnType<typeof buildAgent>, question: string) {
  const result = await graph.invoke({ messages: [new HumanMessage(question)] });
  return result.messages;
}
