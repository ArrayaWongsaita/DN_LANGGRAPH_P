import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

const State = new StateSchema({
  docs: z.array(z.string()).default(() => []),
  counts: new ReducedValue(z.array(z.number()).default(() => []), {
    inputSchema: z.number(),
    reducer: (current: number[], next: number) => [...current, next],
  }),
  total: z.number().default(0),
});

export function buildMapReduceGraph() {
  return new StateGraph(State)
    .addNode("countWords", (input: unknown) => {
      const { doc } = input as { doc: string };
      return { counts: doc.split(" ").length };
    })
    .addNode("sum", (state) => ({ total: state.counts.reduce((a, b) => a + b, 0) }))
    .addConditionalEdges(START, (state) => state.docs.map((doc) => new Send("countWords", { doc })), ["countWords"])
    .addEdge("countWords", "sum")
    .addEdge("sum", END)
    .compile();
}
