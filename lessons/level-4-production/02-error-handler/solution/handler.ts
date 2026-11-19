import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { NodeError } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-02  (ไม่ใช้ LLM)
// node ที่ล้มเหลวหลังลองใหม่ครบแล้ว: ให้ "error handler" ตัดสินว่าจะทำอะไรต่อ (เช่นไปทางชดเชย) แทนที่ graph จะพังทั้งตัว
const State = new StateSchema({
  status: z.string().default("ใหม่"),
  log: z.string().default(""),
});

const counter = { charge: 0 }; // นับจำนวนครั้งที่ node charge ถูกรัน

// handler ได้รับ state กับ error ของ node ที่ล้ม
function onChargeFailed(_state: unknown, error: NodeError) {
  // ข้อ 1: คืน new Command({ update: { status: `ชดเชยหลัง ${error.node}: ${error.error.message}` }, goto: "compensate" })
  return new Command({ update: { status: `ชดเชยหลัง ${error.node}: ${error.error.message}` }, goto: "compensate" });
}

// ข้อ 2: ตั้ง errorHandler ให้เป็นฟังก์ชัน onChargeFailed
const errorHandler = onChargeFailed;

const options = {
  retryPolicy: { maxAttempts: 3, initialInterval: 1 },
  ends: ["compensate"],
  errorHandler,
};

const checkout = new StateGraph(State)
  .addNode(
    "charge",
    () => {
      counter.charge++;
      throw new Error("บัตรถูกปฏิเสธ");
    },
    options as never,
  )
  .addNode("compensate", (state) => ({ log: `คืนเงิน (${state.status})` }))
  .addEdge(START, "charge")
  .addEdge("compensate", END)
  .compile();

const result = await checkout.invoke({});
console.log(result.log, "| charge ถูกรัน", counter.charge, "ครั้ง");

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
const direct = onChargeFailed({}, { node: "charge", error: new Error("บัตรถูกปฏิเสธ") } as never);
check("handler เดี่ยว ๆ: สั่งไป compensate พร้อมเหตุผลที่มีชื่อ node และข้อความ error", direct instanceof Command && direct.goto?.toString() === "compensate" && JSON.stringify(direct.update) === JSON.stringify({ status: "ชดเชยหลัง charge: บัตรถูกปฏิเสธ" }));
check("node ล้มเหลว: graph ไม่พัง แต่ไปทางชดเชยพร้อมเหตุผล", result.log === "คืนเงิน (ชดเชยหลัง charge: บัตรถูกปฏิเสธ)", "ตั้ง errorHandler ใน options");
check("handler ทำงานหลังลองใหม่ครบ 3 ครั้งแล้วเท่านั้น", counter.charge === 3);
