import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { type AIMessage, HumanMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";

export async function askWithTools(
  llm: BaseChatModel,
  tools: StructuredToolInterface[],
  question: string,
): Promise<AIMessage> {
  const bound = llm.bindTools!(tools);
  return (await bound.invoke([new HumanMessage(question)])) as AIMessage;
}

export interface ToolCallRequest {
  name: string;
  args: Record<string, unknown>;
}

export async function runToolCall(
  tools: StructuredToolInterface[],
  call: ToolCallRequest,
): Promise<string> {
  const found = tools.find((t) => t.name === call.name);
  if (!found) throw new Error(`ไม่มี tool ชื่อ ${call.name}`);
  return String(await found.invoke(call.args));
}
