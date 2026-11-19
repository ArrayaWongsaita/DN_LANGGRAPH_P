import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-24  (ไม่ใช้ LLM)
// ขอหลาย streamMode พร้อมกันได้ (ส่งเป็นอาร์เรย์): ทุกชิ้นที่ได้เป็นคู่ [โหมด, ข้อมูล]
const State = new StateSchema({ pages: z.number().default(0), done: z.string().default("") });

// graph จากบท 2-23 (ย่อไว้ให้)
const graph = new StateGraph(State)
  .addNode("crawl", (state, config) => {
    for (let i = 1; i <= state.pages; i++) config.writer?.({ page: i });
    return { done: `ครบ ${state.pages} หน้า` };
  })
  .addEdge(START, "crawl")
  .addEdge("crawl", END)
  .compile();

const timeline: string[] = []; // เช่น ["custom:1", "custom:2", "updates:crawl"]
// 👉 ข้อ 1: เปิด stream พร้อมสองโหมด: graph.stream({ pages: 2 }, { streamMode: ["updates", "custom"] })
const stream: AsyncIterable<[string, Record<string, unknown>]> = todo(1);
for await (const [mode, data] of stream) {
  // 👉 ข้อ 2: ถ้า mode เป็น "custom" push `custom:${data.page}` ถ้าเป็น "updates" push `updates:${Object.keys(data)[0]}`
  todo(2);
}
console.log("ลำดับเหตุการณ์:", timeline);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ทั้ง custom และ updates ตามลำดับเวลา", JSON.stringify(timeline) === '["custom:1","custom:2","updates:crawl"]', 'ขอ streamMode: ["updates", "custom"] แล้วแยกตาม mode');
