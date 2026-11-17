import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { todo } from "@src/todo";

const State = new StateSchema({ messages: MessagesValue });

export function buildAgent(llm: BaseChatModel, tools: StructuredToolInterface[]) {
  const llmWithTools = llm.bindTools!(tools);
  return new StateGraph(State)
    .addNode("agent", async (state) => {
      // 👉 ข้อ 1: เรียก llmWithTools.invoke(state.messages) แล้วคืนผลเข้า messages
      return todo(1);
    })
    .addNode("tools", new ToolNode(tools))
    .addEdge(START, "agent")
    // 👉 ข้อ 2: เพิ่ม conditional edge จาก "agent" ใช้ toolsCondition ปลายทางที่เป็นไปได้คือ ["tools", END]
    //          แนวทาง: .addConditionalEdges("agent", toolsCondition, ["tools", END])
    // 👉 ข้อ 3: เพิ่ม edge จาก "tools" กลับไป "agent" เพื่อปิดวง
    .compile();
}

export async function runAgent(graph: ReturnType<typeof buildAgent>, question: string) {
  const result = await graph.invoke({ messages: [new HumanMessage(question)] });
  return result.messages;
}
