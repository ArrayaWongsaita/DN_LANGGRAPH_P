import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-08  (ไม่ใช้ LLM)
// สองสายยาวไม่เท่ากัน (b1 สั้น, a->b2->b3 ยาว) แต่ "final" ควรรอให้ทุกสายเสร็จก่อน ใช้ defer: true
const State = new StateSchema({
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

const graph = new StateGraph(State)
  .addNode("a", () => ({ log: "a" }))
  .addNode("b1", () => ({ log: "b1" }))
  .addNode("b2", () => ({ log: "b2" }))
  .addNode("b3", () => ({ log: "b3" }))
  .addNode(
    "final",
    () => ({ log: "final" }),
    // 👉 ข้อ 1 ทำให้ final รอทุกสายเสร็จ ด้วย options { defer: true }
    // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
    //   { defer: true },
    todo(1),
  )
  .addEdge(START, "a")
  .addEdge(START, "b1")
  .addEdge("a", "b2")
  .addEdge("b2", "b3")
  .addEdge("b1", "final")
  .addEdge("b3", "final")
  .addEdge("final", END)
  .compile();

const result = await graph.invoke({});
console.log(result.log);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ทุก node ทำงานครบ", [...result.log].sort().join(",") === "a,b1,b2,b3,final");
check("final ทำงานเป็นขั้นสุดท้าย หลังสายยาวเสร็จ (b3 มาก่อน final)", result.log[result.log.length - 1] === "final", "ถ้าไม่ defer, final จะรันทันทีที่ b1 เสร็จ");
