import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

export const ProfileState = new StateSchema({
  name: z.string(),
  age: z.number().default(0),
  city: z.string().default(""),
});

export function buildProfileGraph() {
  return new StateGraph(ProfileState)
    .addNode("show", (state) => ({ name: state.name }))
    .addEdge(START, "show")
    .addEdge("show", END)
    .compile();
}
