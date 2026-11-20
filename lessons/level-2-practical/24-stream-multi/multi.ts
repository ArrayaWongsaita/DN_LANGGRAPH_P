// รันแบบออฟไลน์ ใช้ node ส่งความคืบหน้าจากบท 2-23
import { END, START, StateGraph, StateSchema, type StreamMode } from "@langchain/langgraph";
import { check } from "@src/check";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  pages: z.number().default(0),
  done: z.string().default(""),
});
const graph = new StateGraph(State)
  .addNode("crawl", ({ pages }, config) => {
    for (let page = 1; page <= pages; page++) config.writer?.({ page });
    return { done: `ครบ ${pages} หน้า` };
  })
  .addEdge(START, "crawl")
  .addEdge("crawl", END)
  .compile();

// 👉 ข้อ 1 ขอทั้ง updates และ custom ในอาร์เรย์เดียว
const streamMode: StreamMode[] = todo(1);
const stream = await graph.stream({ pages: 2 }, { streamMode });
const timeline = [];
for await (const [mode, data] of stream) {
  timeline.push([mode, data]);
  console.log(JSON.stringify([mode, data]));
}

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check(
  "ได้ custom ตามด้วย updates ของ crawl",
  JSON.stringify(timeline) === '[["custom",{"page":1}],["custom",{"page":2}],["updates",{"crawl":{"done":"ครบ 2 หน้า"}}]]',
  'ส่งอาร์เรย์ ["updates", "custom"] ให้ streamMode',
);
