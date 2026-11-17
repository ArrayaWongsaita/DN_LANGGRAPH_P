import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { todo } from "@src/todo";

const State = new StateSchema({
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

export function buildStreamDemo() {
  return new StateGraph(State)
    .addNode("first", () => ({ log: "first" }))
    .addNode("second", () => ({ log: "second" }))
    .addEdge(START, "first")
    .addEdge("first", "second")
    .addEdge("second", END)
    .compile();
}

interface Streamable {
  stream(input: never, options: { streamMode: "updates" | "values" }): Promise<AsyncIterable<unknown>>;
}

// streamMode "updates": ทุกครั้งที่ node ทำงานเสร็จ ได้ { ชื่อ node: สิ่งที่ node นั้นอัปเดต }
export async function collectUpdates(
  graph: Streamable,
  input: object,
): Promise<{ node: string; update: unknown }[]> {
  const result: { node: string; update: unknown }[] = [];

  // 👉 ข้อ 1: เปิด stream ด้วย { streamMode: "updates" } แล้ววนอ่านด้วย for await
  //          แต่ละชิ้นเป็น object ที่มี key เดียวคือชื่อ node ให้เก็บ { node, update } ลง result
  // แนวทาง: for await (const chunk of await graph.stream(input as never, { streamMode: "updates" })) {
  //           for (const [node, update] of Object.entries(chunk as object)) result.push({ node, update });
  //         }
  todo(1);

  return result;
}

// streamMode "values": ทุกก้าวได้ "state ทั้งก้อน" (ชิ้นแรกคือ state เริ่มต้นก่อน node ใดทำงาน)
export async function collectValues(graph: Streamable, input: object): Promise<unknown[]> {
  const result: unknown[] = [];

  // 👉 ข้อ 2: เหมือนข้อ 1 แต่ใช้ { streamMode: "values" } และเก็บ chunk ทั้งก้อนลง result
  todo(2);

  return result;
}
