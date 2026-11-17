import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { GraphRecursionError } from "@langchain/langgraph";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";

// agent แบบ ReAct จากบท 2-11 (ย่อไว้ในไฟล์นี้เพื่อให้แต่ละบทอยู่ได้ด้วยตัวเอง)
const AgentState = new StateSchema({ messages: MessagesValue });
function buildAgent(llm: BaseChatModel, tools: StructuredToolInterface[]) {
  const llmWithTools = llm.bindTools!(tools);
  return new StateGraph(AgentState)
    .addNode("agent", async (state) => ({ messages: [await llmWithTools.invoke(state.messages)] }))
    .addNode("tools", new ToolNode(tools))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", toolsCondition, ["tools", END])
    .addEdge("tools", "agent")
    .compile();
}

export function limitFor(maxToolRounds: number): number {
  return 2 * maxToolRounds + 2;
}

export type SafeResult = { ok: true; answer: string } | { ok: false; reason: string };

export async function safeRun(
  llm: BaseChatModel,
  tools: StructuredToolInterface[],
  question: string,
  maxToolRounds: number,
): Promise<SafeResult> {
  const graph = buildAgent(llm, tools);
  try {
    const result = await graph.invoke(
      { messages: [new HumanMessage(question)] },
      { recursionLimit: limitFor(maxToolRounds) },
    );
    return { ok: true, answer: result.messages[result.messages.length - 1].text };
  } catch (e) {
    if (e instanceof GraphRecursionError) return { ok: false, reason: "agent วนเกินกำหนด" };
    throw e;
  }
}
