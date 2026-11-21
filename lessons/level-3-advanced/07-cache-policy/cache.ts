import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { InMemoryCache } from "@langchain/langgraph-checkpoint";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-07  (ไม่ใช้ LLM)
// cachePolicy = จำผลของ node: ถ้า input เหมือนเดิม ไม่ต้องรันซ้ำ (ประหยัดเวลา/เงินกับงานที่แพง)
const State = new StateSchema({
  q: z.string().default(""),
  out: z.string().default(""),
});
const counter = { runs: 0 };

const builder = new StateGraph(State)
  .addNode(
    "expensive",
    (state) => {
      counter.runs++;
      return { out: `${state.q}!` };
    },
    // 👉 ข้อ 1 ตั้ง options ของ node: { cachePolicy: { ttl: 60 } }  (จำผลไว้ 60 วินาที)
    // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
    //   { cachePolicy: { ttl: 60 } },
    todo(1),
  )
  .addEdge(START, "expensive")
  .addEdge("expensive", END);

const graph = builder.compile({ cache: new InMemoryCache() });

const first = await graph.invoke({ q: "hi" });
const second = await graph.invoke({ q: "hi" });
const afterSame = counter.runs;
const third = await graph.invoke({ q: "other" });
console.log({ first: first.out, second: second.out, runsAfterSame: afterSame, runsAfterOther: counter.runs });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("input เดิมสองครั้ง node รันแค่ครั้งเดียว", afterSame === 1, "ต้องมีทั้ง cachePolicy และ cache ตอน compile");
check("ผลที่ได้จากแคชเหมือนผลจริง", first.out === "hi!" && second.out === "hi!");
check("input ใหม่ต้องรันใหม่", counter.runs === 2 && third.out === "other!");
