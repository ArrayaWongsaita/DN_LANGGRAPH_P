import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";

export interface Models {
  cheap: BaseChatModel;
  strong: BaseChatModel;
}

// คำถามยาวกว่า 30 ตัวอักษรใช้ strong ไม่เช่นนั้นใช้ cheap
export function pickModel(question: string, models: Models): BaseChatModel {
  // 👉 ข้อ 1: คืน models.strong ถ้า question.length > 30 ไม่เช่นนั้น models.cheap
  return todo(1);
}

// ให้เห็น tool ที่ชื่อ "getWeather" เฉพาะเมื่อคำถามมีคำว่า "อากาศ", ส่วน tool อื่นเห็นเสมอ
export function pickTools(question: string, tools: StructuredToolInterface[]): StructuredToolInterface[] {
  // 👉 ข้อ 2: กรอง tools: ตัด getWeather ออกถ้า question ไม่มี "อากาศ"
  return todo(2);
}

const State = new StateSchema({ messages: MessagesValue });

export function buildDynamicGraph(models: Models, allTools: StructuredToolInterface[]) {
  return new StateGraph(State)
    .addNode("agent", async (state) => {
      const question = state.messages[0].text;
      const model = pickModel(question, models);
      const tools = pickTools(question, allTools);
      const bound = tools.length ? model.bindTools!(tools) : model;
      return { messages: [await bound.invoke(state.messages)] };
    })
    .addEdge(START, "agent")
    .addEdge("agent", END)
    .compile();
}

export async function ask(graph: ReturnType<typeof buildDynamicGraph>, question: string) {
  const result = await graph.invoke({ messages: [new HumanMessage(question)] });
  return result.messages[result.messages.length - 1].text;
}
