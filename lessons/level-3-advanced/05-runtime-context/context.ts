import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-05  (ไม่ใช้ LLM)
// context = ค่าที่ส่งเข้ามาตอน invoke แต่ "ไม่ใช่ state" (เช่นภาษา, userId) อ่านได้จาก runtime.context ใน node
const State = new StateSchema({ out: z.string().default("") });

// 👉 ข้อ 1: ส่ง options ที่สองให้ StateGraph: { context: z.object({ lang: z.string().optional() }) }
const builder = todo(1);

const graph = builder
  .addNode("greet", (state, runtime) => {
    // 👉 ข้อ 2: คืน { out: "Hello" } ถ้า runtime.context?.lang เป็น "en" ไม่เช่นนั้นคืน { out: "สวัสดี" }
    return todo(2);
  })
  .addEdge(START, "greet")
  .addEdge("greet", END)
  .compile();

const en = await graph.invoke({}, { context: { lang: "en" } });
const th = await graph.invoke({}, { context: { lang: "th" } });
const none = await graph.invoke({});
console.log({ en: en.out, th: th.out, none: none.out });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("context lang = en ได้ Hello", en.out === "Hello", "อ่านจาก runtime.context?.lang");
check("context lang = th ได้ สวัสดี", th.out === "สวัสดี");
check("ไม่ส่ง context ก็ใช้ค่าเริ่มต้น (สวัสดี)", none.out === "สวัสดี");
