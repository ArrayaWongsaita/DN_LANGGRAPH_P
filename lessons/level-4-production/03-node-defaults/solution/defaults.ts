import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-03  (ไม่ใช้ LLM)
// ตั้งค่าเริ่มต้นให้ "ทุก node" ครั้งเดียว (retry policy) แล้วทับเฉพาะ node ที่ต้องการต่างออกไป
const State = new StateSchema({ log: z.string().default("") });

const attempts = { a: 0, b: 0, strict: 0 };

// node ที่ล้มเหลว failTimes ครั้งแรกแล้วสำเร็จ
const flaky = (name: keyof typeof attempts, failTimes: number) => () => {
  attempts[name]++;
  if (attempts[name] <= failTimes) throw new Error(`${name} ล้ม`);
  return {};
};

const defaults = { retryPolicy: { maxAttempts: 3, initialInterval: 1 } };
const strictOptions = { retryPolicy: { maxAttempts: 1 } };

const app = new StateGraph(State)
  .setNodeDefaults(defaults as never)
  .addNode("a", flaky("a", 2))
  .addNode("b", flaky("b", 2))
  .addNode("strict", flaky("strict", 1), strictOptions as never)
  .addEdge(START, "a")
  .addEdge(START, "b")
  .addEdge("a", "strict")
  .addEdge("b", "strict")
  .addEdge("strict", END)
  .compile();

let failure = "";
try {
  await app.invoke({});
} catch (e) {
  failure = (e as Error).message;
}
console.log({ attempts, failure });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("a และ b ล้มสองครั้งแต่ใช้ค่าเริ่มต้น (ลองสูงสุด 3): ถูกลองจนสำเร็จ", attempts.a === 3 && attempts.b === 3, "ใช้ .setNodeDefaults(defaults)");
check("strict ตั้งทับเป็นลองครั้งเดียว: ล้มแล้วจบ ไม่ลองใหม่", attempts.strict === 1 && failure === "strict ล้ม", "ส่ง strictOptions เป็นอาร์กิวเมนต์ที่สามของ addNode");
