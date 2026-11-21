// รันแบบออฟไลน์ จำลองการอ่านทีละหน้าด้วยการรอช่วงสั้น ๆ
import { setTimeout } from "node:timers/promises";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { check } from "@src/check";
import { z } from "zod";

const State = new StateSchema({
  pages: z.number().default(0),
  done: z.string().default(""),
});
const graph = new StateGraph(State)
  .addNode("crawl", async ({ pages }, config) => {
    for (let page = 1; page <= pages; page++) {
      await setTimeout(20);
      config.writer?.({ page, total: pages });
    }
    return { done: `ครบ ${pages} หน้า` };
  })
  .addEdge(START, "crawl")
  .addEdge("crawl", END)
  .compile();

const events = [];
const stream = await graph.stream({ pages: 3 }, { streamMode: "custom" });
for await (const event of stream) {
  events.push(event);
  console.log(JSON.stringify(event));
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check(
  "ได้ความคืบหน้าของทั้ง 3 หน้าตามลำดับ",
  events.length === 3 && events.every((event, index) => event?.page === index + 1 && event?.total === 3),
  "ส่ง { page, total: pages } ด้วย config.writer ในลูป",
);
