import type { AIMessage, ToolMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";

export function makeToolNode(tools: StructuredToolInterface[]): ToolNode {
  return new ToolNode(tools);
}

export async function executeCalls(
  tools: StructuredToolInterface[],
  aiMessage: AIMessage,
): Promise<ToolMessage[]> {
  const node = makeToolNode(tools);
  const result = await node.invoke({ messages: [aiMessage] });
  return result.messages;
}
