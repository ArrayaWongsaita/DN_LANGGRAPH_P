import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-04  (ไม่ใช้ LLM)
// map-reduce = แตกงานทำพร้อมกัน (map ด้วย Send) แล้วรวมผล (reduce) ใน node ถัดไปหลังทุกชิ้นเสร็จ
const State = new StateSchema({
  docs: z.array(z.string()).default(() => []),
  counts: new ReducedValue(z.array(z.number()).default(() => []), {
    inputSchema: z.number(),
    reducer: (current: number[], next: number) => [...current, next],
  }),
  total: z.number().default(0),
});

const graph = new StateGraph(State)
  .addNode("countWords", (input: unknown) => {
    const { doc } = input as { doc: string };
    // ข้อ 1 (map): คืน { counts: จำนวนคำของ doc } โดยคำคั่นด้วยช่องว่าง
    return { counts: doc.split(" ").length };
  })
  .addNode("sum", (state) => {
    // ข้อ 2 (reduce): คืน { total: ผลรวมของ state.counts }
    return { total: state.counts.reduce((a, b) => a + b, 0) };
  })
  .addConditionalEdges(
    START,
    (state) => {
      // ข้อ 3: แตกงานหนึ่งอันต่อหนึ่งเอกสาร: new Send("countWords", { doc })
      return state.docs.map((doc) => new Send("countWords", { doc }));
    },
    ["countWords"],
  )
  .addEdge("countWords", "sum")
  .addEdge("sum", END)
  .compile();

const result = await graph.invoke({ docs: ["one two three", "four five", "six"] });
console.log(result);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("map: นับคำของแต่ละเอกสารได้ครบ", JSON.stringify([...result.counts].sort()) === "[1,2,3]", "countWords คืน { counts: จำนวนคำ }");
check("reduce: total = 6", result.total === 6, "sum รวม counts ทั้งหมด หลังทุกชิ้นเสร็จ");
