import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-23  (ไม่ใช้ LLM)
// streamMode "custom" = node ส่ง "ความคืบหน้า" ของตัวเองออกมาได้ขณะที่ยังทำงานอยู่ (ผ่าน config.writer)
const State = new StateSchema({
  pages: z.number().default(0),
  done: z.string().default(""),
});

const graph = new StateGraph(State)
  .addNode("crawl", (state, config) => {
    for (let i = 1; i <= state.pages; i++) {
      // 👉 ข้อ 1: ส่งความคืบหน้าหลังประมวลผลหน้าที่ i: config.writer?.({ page: i, total: state.pages })
      todo(1);
    }
    return { done: `ครบ ${state.pages} หน้า` };
  })
  .addEdge(START, "crawl")
  .addEdge("crawl", END)
  .compile();

const seen: string[] = [];
// 👉 ข้อ 2: for await (const c of await graph.stream({ pages: 3 }, { streamMode: "custom" }))
//        แต่ละ c คือ { page, total } ให้ push `${c.page}/${c.total}` ลง seen
todo(2);
console.log("ความคืบหน้า:", seen);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ความคืบหน้าครบทุกหน้า เรียงตามลำดับ", JSON.stringify(seen) === '["1/3","2/3","3/3"]', "node ต้องเรียก config.writer ทุกหน้า และอ่านด้วย streamMode custom");
