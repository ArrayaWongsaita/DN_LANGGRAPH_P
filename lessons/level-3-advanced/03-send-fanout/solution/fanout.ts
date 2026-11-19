import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-03  (ไม่ใช้ LLM)
// Send = สั่งให้ node เดียวกันทำงาน "หลายชุดพร้อมกัน" โดยแต่ละชุดมี input ของตัวเอง (จำนวนชุดรู้ตอนรัน)
const State = new StateSchema({
  items: z.array(z.string()).default(() => []),
  out: new ReducedValue(z.array(z.string()).default(() => []), {
    inputSchema: z.string(),
    reducer: (current: string[], next: string) => [...current, next],
  }),
});

const graph = new StateGraph(State)
  .addNode("work", (input: unknown) => {
    const { item } = input as { item: string };
    // ข้อ 1: คืน { out: item.toUpperCase() }
    return { out: item.toUpperCase() };
  })
  .addConditionalEdges(
    START,
    (state) => {
      // ข้อ 2: คืนรายการ Send หนึ่งอันต่อหนึ่ง item: new Send("work", { item })
      return state.items.map((item) => new Send("work", { item }));
    },
    ["work"],
  )
  .addEdge("work", END)
  .compile();

const three = await graph.invoke({ items: ["a", "b", "c"] });
const five = await graph.invoke({ items: ["x", "y", "z", "w", "v"] });
console.log({ three: three.out, five: five.out });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("งานสามชิ้น ได้ผลครบ (ลำดับอาจต่างกัน)", JSON.stringify([...three.out].sort()) === '["A","B","C"]', "แต่ละ Send รัน node work หนึ่งครั้ง");
check("จำนวนชุดขึ้นกับข้อมูลตอนรัน (5 ชิ้น = 5 ผล)", five.out.length === 5);
