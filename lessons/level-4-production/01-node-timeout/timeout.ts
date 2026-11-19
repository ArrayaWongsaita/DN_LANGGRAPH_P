import { END, START, StateGraph, StateSchema, isNodeTimeoutError } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-01  (ไม่ใช้ LLM)
// node ที่ค้างนานเกินไปต้องถูกตัดทิ้ง: ตั้งเพดานเวลาให้ node แล้วจับ error "หมดเวลา" ได้
const State = new StateSchema({ log: z.string().default("") });

// สร้าง graph ที่มี node "slow" หน่วงเวลา workMs แล้วค่อยเสร็จ โดยมีเพดาน timeoutMs
function buildJob(workMs: number, timeoutMs: number) {
  // 👉 ข้อ 1: options ของ node: { timeout: timeoutMs }
  const options = todo(1);
  return new StateGraph(State)
    .addNode(
      "slow",
      async () => {
        await new Promise((resolve) => setTimeout(resolve, workMs));
        return { log: "เสร็จ" };
      },
      options,
    )
    .addEdge(START, "slow")
    .addEdge("slow", END)
    .compile();
}

type RunResult = { ok: true; log: string } | { ok: false; node: string };

async function runJob(job: { invoke: (input: object) => Promise<{ log: string }> }): Promise<RunResult> {
  try {
    const result = await job.invoke({});
    return { ok: true, log: result.log };
  } catch (error) {
    // 👉 ข้อ 2: ถ้า isNodeTimeoutError(error) คืน { ok: false, node: error.node } ไม่เช่นนั้นโยน error ต่อ (throw error)
    return todo(2);
  }
}

const fast = await runJob(buildJob(10, 1000));
const started = Date.now();
const timedOut = await runJob(buildJob(2000, 50));
const elapsed = Date.now() - started;
console.log({ fast, timedOut, elapsedMs: elapsed });

// error ชนิดอื่นต้องไม่ถูกแปลงเป็น "หมดเวลา": ข้อความมีคำว่า timed out เฉย ๆ ไม่ใช่ timeout ของ node
const broken = new StateGraph(State)
  .addNode("api", () => {
    throw new Error("upstream request timed out");
  })
  .addEdge(START, "api")
  .addEdge("api", END)
  .compile();
let rethrown = "";
try {
  await runJob(broken);
} catch (e) {
  rethrown = (e as Error).message;
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ทำงานเร็วกว่าเพดาน: สำเร็จ", fast.ok && fast.log === "เสร็จ");
check("ช้ากว่าเพดาน: ได้ผลหมดเวลาพร้อมชื่อ node (ไม่ใช่ exception)", !timedOut.ok && timedOut.node === "slow", "ใช้ isNodeTimeoutError(error) แล้วอ่าน error.node");
check("หมดเวลาแล้วกลับมาเร็ว ไม่รอจนงาน 2 วินาทีเสร็จ", elapsed < 1000);
check("error ชนิดอื่นถูกโยนต่อ ไม่ถูกแปลงเป็น \"หมดเวลา\"", rethrown === "upstream request timed out", "ไม่ใช่ timeout ของ node ให้ throw error ต่อ");
