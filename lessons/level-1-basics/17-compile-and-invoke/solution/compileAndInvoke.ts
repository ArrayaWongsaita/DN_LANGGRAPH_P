import { END, GraphRecursionError, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 17  (ไม่ใช้ LLM)
const State = new StateSchema({ n: z.number().default(0) });

// StateGraph ที่เราต่อ node/edge อยู่ เป็นแค่ "แบบแปลน" ยังรันไม่ได้
// ต้อง .compile() ก่อน จึงได้ graph ที่ตรวจความถูกต้องแล้วและ .invoke(...) ได้
const builder = new StateGraph(State)
  .addNode("inc", (s) => ({ n: s.n + 1 }))
  .addEdge(START, "inc")
  .addEdge("inc", END);

// ข้อ 1: แปลงแบบแปลนเป็น graph ที่รันได้
const graph = builder.compile();

const result = await graph.invoke({ n: 1 });
console.log("ผลลัพธ์:", result);
check("compile แล้ว invoke ได้ state สุดท้าย { n: 2 }", result.n === 2, "ต้อง .compile() ก่อน invoke");

// graph ที่วนไม่จบ: node inc ชี้กลับตัวเองตลอด (ให้มาแล้ว)
const neverEnding = new StateGraph(State)
  .addNode("inc", (s) => ({ n: s.n + 1 }))
  .addEdge(START, "inc")
  .addConditionalEdges("inc", () => "inc", ["inc", END])
  .compile();

// recursionLimit = "จำนวนก้าวสูงสุด" กัน graph ที่วนไม่จบ
let status: "ok" | "limit" = "ok";
try {
  // ข้อ 2: เรียก neverEnding.invoke ด้วย config { recursionLimit: 5 }
  await neverEnding.invoke({}, { recursionLimit: 5 });
} catch (e) {
  // ข้อ 3: ถ้า error คือ GraphRecursionError (วนเกิน limit) ให้ตั้ง status = "limit"
  //        error ชนิดอื่นต้อง throw ต่อ (อย่ากลืน error ที่ไม่รู้จัก)
  if (e instanceof GraphRecursionError) status = "limit";
  else throw e;
}
console.log("status:", status);
check("graph วนไม่จบถูกหยุดที่ limit (ไม่ crash)", status === "limit", "จับ GraphRecursionError แล้วตั้ง status = 'limit'");
