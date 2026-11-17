import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { InMemoryCache } from "@langchain/langgraph-checkpoint";
import { z } from "zod";

const State = new StateSchema({
  q: z.string().default(""),
  out: z.string().default(""),
});

export function buildCachedGraph(counter: { runs: number }) {
  return new StateGraph(State)
    .addNode(
      "expensive",
      (state) => {
        counter.runs++;
        return { out: `${state.q}!` };
      },
      { cachePolicy: { ttl: 60 } },
    )
    .addEdge(START, "expensive")
    .addEdge("expensive", END)
    .compile({ cache: new InMemoryCache() });
}
