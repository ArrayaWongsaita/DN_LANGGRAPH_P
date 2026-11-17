import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({ n: z.number().default(0) });

export function buildSample() {
  return new StateGraph(State)
    .addNode("inc", (s) => ({ n: s.n + 1 }))
    .addNode("done", (s) => ({ n: s.n }))
    .addEdge(START, "inc")
    .addConditionalEdges("inc", (s) => (s.n >= 3 ? "done" : "inc"), ["inc", "done"])
    .addEdge("done", END)
    .compile();
}

type Sample = ReturnType<typeof buildSample>;

export async function toMermaid(graph: Sample): Promise<string> {
  // 👉 ข้อ 1: const g = await graph.getGraphAsync(); คืน g.drawMermaid()
  return todo(1);
}

// รายชื่อ node ที่เราประกาศเอง (ไม่รวม __start__ และ __end__)
export async function nodeNames(graph: Sample): Promise<string[]> {
  // 👉 ข้อ 2: ใช้ Object.keys((await graph.getGraphAsync()).nodes) แล้วกรองชื่อที่ขึ้นต้นด้วย "__" ออก
  return todo(2);
}
