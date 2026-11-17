import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { GraphRecursionError } from "@langchain/langgraph";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { todo } from "@src/todo";

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

// จำนวน step ที่พอสำหรับ agent ที่ใช้ tool ได้มากสุด maxToolRounds รอบ
export function limitFor(maxToolRounds: number): number {
  // 👉 ข้อ 1: คืน 2 * maxToolRounds + 2 (เผื่อ 1 step ให้ START)
  return todo(1);
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
    // 👉 ข้อ 2: invoke ด้วย config { recursionLimit: limitFor(maxToolRounds) }
    const result = todo(2);
    return { ok: true, answer: result.messages[result.messages.length - 1].text };
  } catch (e) {
    // 👉 ข้อ 3: ถ้า e เป็น GraphRecursionError คืน { ok: false, reason: "agent วนเกินกำหนด" } ถ้าเป็น error อื่นให้ throw ต่อ
    return todo(3);
  }
}
