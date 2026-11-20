import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";
import { todo } from "@src/todo";

const State = new StateSchema({
  score: new ReducedValue(z.number().default(0), {
    inputSchema: z.number(),
    // 👉 ข้อ 1 คืนผลบวกของคะแนนเดิมและคะแนนที่ส่งมา
    reducer: (current, next): number => todo(1),
  }),
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current, next) => [...current, next],
  }),
});

const graph = new StateGraph(State)
  .addNode("a", () => ({ score: 1, log: "a" }))
  .addNode("b", () => ({ score: 2, log: "b" }))
  .addEdge(START, "a")
  .addEdge(START, "b")
  .addEdge("a", END)
  .addEdge("b", END)
  .compile();

const fromDefault = await graph.invoke({});
const fromTen = await graph.invoke({ score: 10, log: "start" });
console.log(JSON.stringify(fromDefault));
console.log(JSON.stringify(fromTen));

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("รวมคะแนนจากสอง node ได้ 3", fromDefault.score === 3, "รวม current กับ next");
check("เพิ่มจากคะแนนตั้งต้น 10 ได้ 13", fromTen.score === 13);
check("เก็บชื่อทั้งสอง node และข้อความเริ่มต้น", fromTen.log.length === 3 && fromTen.log[0] === "start" && fromTen.log.includes("a") && fromTen.log.includes("b"));
