import { todo } from "@src/todo";
import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 1-19  (ไม่ใช้ LLM)
const State = new StateSchema({
  log: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

const graph = new StateGraph(State)
  .addNode("first", () => ({ log: "first" }))
  .addNode("second", () => ({ log: "second" }))
  .addEdge(START, "first")
  .addEdge("first", "second")
  .addEdge("second", END)
  .compile();

// streamMode "updates": ทุกครั้งที่ node ทำงานเสร็จ ได้ { ชื่อ node: สิ่งที่ node นั้นอัปเดต }
const updates: { node: string; update: unknown }[] = [];

// 👉 ข้อ 1: เปิด stream ด้วย { streamMode: "updates" } แล้ววนอ่านด้วย for await
//          แต่ละชิ้นเป็น object ที่มี key เดียวคือชื่อ node ให้เก็บ { node, update } ลง updates
// แนวทาง: for await (const chunk of await graph.stream({}, { streamMode: "updates" })) {
//           for (const [node, update] of Object.entries(chunk)) updates.push({ node, update });
//         }
todo(1);

// streamMode "values": ทุกก้าวได้ "state ทั้งก้อน" (ชิ้นแรกคือ state เริ่มต้นก่อน node ใดทำงาน)
const values: unknown[] = [];

// 👉 ข้อ 2: เหมือนข้อ 1 แต่ส่ง input { log: "start" } กับ { streamMode: "values" } และเก็บ chunk ทั้งก้อนลง values
todo(2);

console.log("updates:", JSON.stringify(updates));
console.log("values: ", JSON.stringify(values));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check(
  "updates: ได้ชิ้นละ 1 node เรียงตามที่ทำงาน พร้อมสิ่งที่ node นั้นอัปเดต",
  JSON.stringify(updates.map((u) => u.node)) === '["first","second"]' && JSON.stringify(updates[0]?.update) === '{"log":"first"}',
  'ใช้ { streamMode: "updates" } แล้วเก็บ { node, update }',
);
check(
  "values: ได้ state เต็มหลังแต่ละก้าว รวม state เริ่มต้น (2 node = 3 ชิ้น)",
  values.length === 3 && JSON.stringify(values[0]) === '{"log":["start"]}' && JSON.stringify(values[2]) === '{"log":["start","first","second"]}',
  'ใช้ { streamMode: "values" } แล้วเก็บ chunk ทั้งก้อน',
);
