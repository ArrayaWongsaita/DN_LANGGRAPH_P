import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  items: z.array(z.string()).default(() => []),
  out: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

export function buildFanoutGraph() {
  return new StateGraph(State)
    .addNode("work", (input: unknown) => {
      const { item } = input as { item: string };
      return { out: item.toUpperCase() };
    })
    .addConditionalEdges(START, (state) => state.items.map((item) => new Send("work", { item })), ["work"])
    .addEdge("work", END)
    .compile();
}
