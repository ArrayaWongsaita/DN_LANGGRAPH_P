import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import type { NodeError } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";

const State = new StateSchema({
  status: z.string().default("ใหม่"),
  log: z.string().default(""),
});

export const counter = { charge: 0 };

// 👉 ข้อ 1: ฟังก์ชัน handler (state, error: NodeError) คืน
//          new Command({ update: { status: `ชดเชยหลัง ${error.node}: ${error.error.message}` }, goto: "compensate" })
export function onChargeFailed(_state: unknown, error: NodeError) {
  return todo(1);
}

export function buildCheckout() {
  // 👉 ข้อ 2: errorHandler = onChargeFailed
  const errorHandler = todo(2);
  const options = {
    retryPolicy: { maxAttempts: 3, initialInterval: 1 },
    ends: ["compensate"],
    errorHandler,
  };
  return new StateGraph(State)
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
}
