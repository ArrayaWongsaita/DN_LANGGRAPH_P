import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-02  (ไม่ใช้ LLM)
// node คืน Command ได้: ทั้ง "อัปเดต state" และ "บอกว่าไป node ไหนต่อ" (goto) ในคำสั่งเดียว (ไม่ต้องใช้ conditional edge แยก)
const State = new StateSchema({
  amount: z.number().default(0),
  log: z.string().default(""),
});

const graph = new StateGraph(State)
  .addNode(
    "triage",
    (state) => {
      // ข้อ 1: คืน new Command({ update: { log: "triage" }, goto: ... })
      //        goto เป็น "premium" ถ้า state.amount >= 1000 ไม่เช่นนั้น "basic"
      return new Command({ update: { log: "triage" }, goto: state.amount >= 1000 ? "premium" : "basic" });
    },
    // ข้อ 2: ประกาศปลายทางที่เป็นไปได้ (ไว้ให้ graph วาดเส้นถูก) ด้วย { ends: ["premium", "basic"] }
    { ends: ["premium", "basic"] },
  )
  .addNode("premium", (state) => ({ log: `${state.log}>premium` }))
  .addNode("basic", (state) => ({ log: `${state.log}>basic` }))
  .addEdge(START, "triage")
  .addEdge("premium", END)
  .addEdge("basic", END)
  .compile();

const big = await graph.invoke({ amount: 5000 });
const small = await graph.invoke({ amount: 100 });
const edge = await graph.invoke({ amount: 1000 });
console.log({ big: big.log, small: small.log, edge: edge.log });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("จำนวนมากไป premium", big.log === "triage>premium", "goto: premium เมื่อ amount >= 1000");
check("จำนวนน้อยไป basic", small.log === "triage>basic");
check("ขอบเขต 1000 พอดี ไป premium", edge.log === "triage>premium");
const drawn = JSON.stringify((await graph.getGraphAsync()).edges.map((e) => `${e.source}>${e.target}`).sort());
check("graph รู้ปลายทางของ triage (จาก ends)", drawn.includes("triage>premium") && drawn.includes("triage>basic"), "ประกาศ { ends: [...] }");
