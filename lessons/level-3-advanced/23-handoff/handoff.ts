import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-23  (ไม่ใช้ LLM)
// handoff: agent (ที่เป็น subgraph) ส่งต่อให้ agent อื่นใน graph แม่ด้วย Command ที่ชี้ graph: Command.PARENT
const S = new StateSchema({
  message: z.string().default(""),
  log: z.string().default(""),
});

// sales เป็น subgraph: ถ้าลูกค้าพูดถึง "พัง" ให้ส่งต่อ support ไม่เช่นนั้นตอบเอง
const sales = new StateGraph(S)
  .addNode("handle", (state) => {
    if (state.message.includes("พัง")) {
      // 👉 ข้อ 1 คืน new Command({ update: { log: `${state.log}sales→support;` }, goto: "support", graph: Command.PARENT })
      // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
      //   return new Command({ update: { log: `${state.log}sales→support;` }, goto: "support", graph: Command.PARENT });
      return todo(1);
    }
    return { log: `${state.log}sales ตอบเอง;` };
  })
  .addEdge(START, "handle")
  .compile();

const team = new StateGraph(S)
  .addNode("support", (state) => ({ log: `${state.log}support รับช่วง;` }))
  .addNode("sales", sales, { ends: ["support"] })
  .addEdge(START, "sales")
  .addEdge("support", END)
  .compile();

const broken = await team.invoke({ message: "สินค้าที่ซื้อไปพังแล้ว" });
const price = await team.invoke({ message: "ขอถามราคาหน่อย" });
console.log({ broken: broken.log, price: price.log });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("เรื่องของพัง: sales ส่งต่อ support", broken.log === "sales→support;support รับช่วง;", "Command.PARENT + goto: support");
check("เรื่องทั่วไป: sales ตอบเอง ไม่ส่งต่อ", price.log === "sales ตอบเอง;");
