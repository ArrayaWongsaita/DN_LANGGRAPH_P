import { END, GraphRecursionError, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";
import { todo } from "@src/todo";

const State = new StateSchema({ n: z.number().default(0), target: z.number() });

const builder = new StateGraph(State)
  .addNode("increment", ({ n }) => ({ n: n + 1 }))
  .addEdge(START, "increment")
  .addConditionalEdges("increment", ({ n, target }) => n < target ? "increment" : END, ["increment", END]);

// 👉 ข้อ 1 compile builder ให้เป็น graph ที่เรียก invoke ได้
const graph: ReturnType<typeof builder.compile> = todo(1);

const outcomes: string[] = [];
for (const [target, recursionLimit] of [[3, 5], [10, 3], [10, 12]]) {
  const input = { n: 1, target };
  try {
    const result = await graph.invoke(input, { recursionLimit });
    outcomes.push(String(result.n));
    console.log(JSON.stringify({ input, recursionLimit, result }));
  } catch (error) {
    if (!(error instanceof GraphRecursionError)) throw error;
    outcomes.push(error.name);
    console.log(JSON.stringify({ input, recursionLimit, error: error.name }));
  }
}

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("compile ครั้งเดียวแล้ว invoke ด้วยอินพุตหลายชุดได้", outcomes[0] === "3" && outcomes[2] === "10");
check("รับ GraphRecursionError เมื่องบไม่พอ", outcomes[1] === "GraphRecursionError");
