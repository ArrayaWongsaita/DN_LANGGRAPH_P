import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-26  (ไม่ใช้ LLM)
// durable execution: งานยาวที่ล่มกลางทาง "ทำต่อจากจุดที่ค้าง" ได้ ไม่ต้องเริ่มใหม่ (ขั้นที่เสร็จแล้วไม่ถูกรันซ้ำ)
// ต้องมี checkpointer และเลือก durability: "sync" = บันทึก checkpoint ทุกขั้นก่อนไปขั้นถัดไป
const runs = { one: 0, two: 0, three: 0 };
const failTwoOnce = { value: true }; // ขั้นที่สองล่มหนึ่งครั้ง (จำลองเครือข่ายล่ม)

const State = new StateSchema({ log: z.string().default("") });
const job = new StateGraph(State)
  .addNode("one", (s) => {
    runs.one++;
    return { log: `${s.log}1` };
  })
  .addNode("two", (s) => {
    runs.two++;
    if (failTwoOnce.value) {
      failTwoOnce.value = false;
      throw new Error("เครือข่ายล่ม");
    }
    return { log: `${s.log}2` };
  })
  .addNode("three", (s) => {
    runs.three++;
    return { log: `${s.log}3` };
  })
  .addEdge(START, "one")
  .addEdge("one", "two")
  .addEdge("two", "three")
  .addEdge("three", END)
  .compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "job-1" } };
let crashed = false;
try {
  // ข้อ 1: รันงานแบบ durability sync: await job.invoke({}, { ...config, durability: "sync" })
  await job.invoke({}, { ...config, durability: "sync" });
} catch (e) {
  // ล่มจากเครือข่ายจริงเท่านั้นถึงนับว่า "ล่ม" ส่วน error อื่น (เช่นยังไม่ได้เติมช่อง) ให้โยนต่อ
  if ((e as Error).message !== "เครือข่ายล่ม") throw e;
  crashed = true;
}

// ข้อ 2: ทำงานต่อจากจุดที่ล่ม: invoke ด้วย input เป็น null และ config เดิม ได้ state สุดท้าย
const finished = await job.invoke(null, config);
console.log({ crashed, runs, log: finished.log });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("งานล่มที่ขั้นสอง", crashed, "ขั้นสองถูกตั้งให้ล่มหนึ่งครั้ง");
check("ทำต่อได้ครบ ได้ log 123", finished.log === "123", "invoke(null, config เดิม)");
check("ขั้นหนึ่งที่เสร็จไปแล้วไม่ถูกรันซ้ำ (รันแค่ครั้งเดียว)", runs.one === 1, "durability sync เก็บ checkpoint หลังขั้นหนึ่งไว้แล้ว");
check("ขั้นสองถูกลองใหม่ (รัน 2 ครั้ง) ขั้นสามรันครั้งเดียว", runs.two === 2 && runs.three === 1);
