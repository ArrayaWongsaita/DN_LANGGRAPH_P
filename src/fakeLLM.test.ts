import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { fakeLLM } from "./fakeLLM";

describe("fakeLLM", () => {
  test("returns scripted replies in order, then cycles", async () => {
    const llm = fakeLLM(["a", "b"]);
    expect((await llm.invoke("x")).content).toBe("a");
    expect((await llm.invoke("x")).content).toBe("b");
    expect((await llm.invoke("x")).content).toBe("a");
  });

  test("stream yields several chunks that join to the reply", async () => {
    const llm = fakeLLM(["hello"]);
    const chunks: string[] = [];
    for await (const chunk of await llm.stream("x")) chunks.push(String(chunk.content));
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join("")).toBe("hello");
  });

  test("works as a dependency of a graph node", async () => {
    const State = Annotation.Root({ answer: Annotation<string> });
    const llm = fakeLLM(["from-fake"]);
    const graph = new StateGraph(State)
      .addNode("ask", async () => ({ answer: String((await llm.invoke("q")).content) }))
      .addEdge(START, "ask")
      .addEdge("ask", END)
      .compile();
    expect(await graph.invoke({})).toEqual({ answer: "from-fake" });
  });
});
