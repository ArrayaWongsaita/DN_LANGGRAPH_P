import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-06  (ไม่ใช้ LLM)
// retryPolicy = ให้ "node" ลองใหม่เองเมื่อพลาด (ตั้งต่อ node) แต่ error ที่ผิดถาวรไม่ควรลองซ้ำ
class PermanentError extends Error {}

const State = new StateSchema({ out: z.string().default("") });
const counters = { flaky: 0, strict: 0 };
const flaky = () => {
  counters.flaky++;
  if (counters.flaky < 3) throw new Error("ล้มเหลวชั่วคราว");
  return { out: "สำเร็จ" };
};
const strict = () => {
  counters.strict++;
  throw new PermanentError("ผิดถาวร");
};

const outcomes: Record<string, string> = {};
for (const mode of ["flaky", "strict"] as const) {
  const graph = new StateGraph(State)
    .addNode("work", mode === "flaky" ? flaky : strict, {
      retryPolicy: {
        maxAttempts: 3,
        initialInterval: 10,
        // 👉 ข้อ 1 retryOn คือฟังก์ชันตัดสินว่า error ไหนควรลองซ้ำ: ไม่ลองซ้ำ PermanentError
        // แนวทาง: (e: unknown) => !(e instanceof PermanentError)
        // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
        //   retryOn: (e: unknown) => !(e instanceof PermanentError),
        retryOn: todo(1),
      },
    })
    .addEdge(START, "work")
    .addEdge("work", END)
    .compile();
  try {
    outcomes[mode] = (await graph.invoke({})).out;
  } catch (e) {
    outcomes[mode] = e instanceof PermanentError ? "PermanentError" : String(e);
  }
}
console.log({ outcomes, counters });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("flaky: ล้มสองครั้ง ครั้งที่สามสำเร็จ", outcomes.flaky === "สำเร็จ" && counters.flaky === 3, "maxAttempts: 3");
check("strict: error ถาวรไม่ถูกลองซ้ำ (เรียกครั้งเดียว)", counters.strict === 1 && outcomes.strict === "PermanentError", "retryOn ต้องคืน false สำหรับ PermanentError");
