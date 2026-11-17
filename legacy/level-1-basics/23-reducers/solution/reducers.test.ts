import { START, END, StateGraph } from "@langchain/langgraph";
import { CounterState, buildParallelGraph, buildSequentialGraph } from "./reducers";

test("field ที่มี reducer แบบ append เก็บทุกค่า", async () => {
  const result = await buildSequentialGraph().invoke({});
  expect(result.log).toEqual(["a", "b"]);
});

test("สอง node ที่ทำงานขนานกันเขียน field ที่มี reducer ได้ ค่ารวมกัน", async () => {
  const result = await buildParallelGraph().invoke({});
  expect(result.score).toBe(3);
  expect([...result.log].sort()).toEqual(["x", "y"]);
});

test("field ที่ไม่มี reducer ค่าหลังทับค่าก่อน", async () => {
  const graph = new StateGraph(CounterState)
    .addNode("one", () => ({ last: "1" }))
    .addNode("two", () => ({ last: "2" }))
    .addEdge(START, "one")
    .addEdge("one", "two")
    .addEdge("two", END)
    .compile();
  expect((await graph.invoke({})).last).toBe("2");
});
