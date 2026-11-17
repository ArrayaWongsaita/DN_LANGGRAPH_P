import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";

export interface Models {
  cheap: BaseChatModel;
  strong: BaseChatModel;
}

export function pickModel(question: string, models: Models): BaseChatModel {
  return question.length > 30 ? models.strong : models.cheap;
}

export function pickTools(question: string, tools: StructuredToolInterface[]): StructuredToolInterface[] {
  return tools.filter((t) => t.name !== "getWeather" || question.includes("อากาศ"));
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
