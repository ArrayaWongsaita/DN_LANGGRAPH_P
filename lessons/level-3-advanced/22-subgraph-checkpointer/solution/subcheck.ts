import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-22  (ไม่ใช้ LLM)
// subgraph ที่มี interrupt ข้างใน: ใส่ checkpointer ที่ graph "แม่" ที่เดียว ลูกใช้ร่วมกันเอง
const S = new StateSchema({ log: z.string().default("") });

// subgraph: ถามยืนยัน
const confirm = new StateGraph(S)
  .addNode("ask", (state) => {
    const answer = interrupt("ยืนยันไหม?");
    return { log: `${state.log}|ตอบ:${answer}` };
  })
  .addEdge(START, "ask")
  .addEdge("ask", END)
  .compile();

const builder = new StateGraph(S)
  .addNode("prepare", (state) => ({ log: `${state.log}เตรียม` }))
  .addNode("confirm", confirm)
  .addEdge(START, "prepare")
  .addEdge("prepare", "confirm")
  .addEdge("confirm", END);

const app = builder.compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "t" } };
const paused = isInterrupted(await app.invoke({}, config));

const finished = await app.invoke(new Command({ resume: "ใช่" }), config);
console.log({ paused, log: finished.log });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("interrupt ใน subgraph ทำให้ graph แม่หยุดรอ", paused, "ต้องมี checkpointer ที่ graph แม่");
check("resume แล้วงานทั้งสองขั้นต่อกัน (เตรียม แล้ว ตอบ:ใช่)", finished.log === "เตรียม|ตอบ:ใช่", "resume ด้วย Command และ config เดิม");
