import { Command, END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-25
// swarm: ไม่มีหัวหน้า agent ส่งต่อให้กันเอง และ "จำว่าตอนนี้ใครคุยอยู่" ข้ามข้อความ (active) เพื่อให้ข้อความถัดไปเริ่มที่คนเดิม
const Name = z.enum(["alice", "bob"]);

const State = new StateSchema({
  message: z.string().default(""),
  active: Name.default("alice"),
  reply: z.string().default(""),
});

// agent ที่ตอบเป็น { reply, handoffTo? } ถ้า handoffTo ไม่ใช่ตัวเอง ให้ส่งต่อ
function makeAgent(self: "alice" | "bob", other: "alice" | "bob") {
  return async (state: { message: string }) => {
    const out = await llm
      .withStructuredOutput(z.object({ reply: z.string(), handoffTo: Name.optional() }), { method: "functionCalling" })
      .invoke(`คุณคือ ${self} ในทีมที่มี alice (ดูแลเรื่องขาย) และ bob (ดูแลเรื่องสินค้าเสียและซัพพอร์ต) ถ้าเรื่องนี้ไม่ใช่หน้าที่ของคุณ ให้ตั้ง handoffTo เป็น ${other} ถ้าเป็นหน้าที่ของคุณไม่ต้องใส่ handoffTo ตอบลูกค้าสั้น ๆ: ${state.message}`);
    if (out.handoffTo && out.handoffTo !== self) {
      // 👉 ข้อ 1 คืน new Command({ update: { reply: out.reply, active: out.handoffTo }, goto: out.handoffTo })
      // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
      //   return new Command({ update: { reply: out.reply, active: out.handoffTo }, goto: out.handoffTo });
      return todo(1);
    }
    return { reply: out.reply, active: self };
  };
}

const builder = new StateGraph(State)
  .addNode("alice", makeAgent("alice", "bob"), { ends: ["bob"] })
  .addNode("bob", makeAgent("bob", "alice"), { ends: ["alice"] })
  .addConditionalEdges(
    START,
    (state) => {
      return state.active;
    },
    ["alice", "bob"],
  )
  .addEdge("alice", END)
  .addEdge("bob", END);

const graph = builder.compile({ checkpointer: new MemorySaver() });

const config = { configurable: { thread_id: "t" } };
const talks: { reply: string; active: string }[] = [];
for (const message of ["สนใจจะซื้อสินค้าใหม่ มีรุ่นไหนแนะนำไหม", "สินค้าที่ซื้อไปเมื่อวานพังแล้ว ช่วยด้วย", "ขอบคุณมากครับ"]) {
  const r = await graph.invoke({ message }, config);
  talks.push({ reply: r.reply, active: r.active });
  console.log(`[${r.active}] ${r.reply.slice(0, 70)}`);
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("เรื่องขายเริ่มที่ alice", talks[0].active === "alice", "start edge ต้องคืน state.active (ค่าเริ่มต้น alice)");
check("เรื่องสินค้าพัง: alice ส่งต่อให้ bob", talks[1].active === "bob", "Command ที่ goto อีกคน พร้อมอัปเดต active");
check("ข้อความถัดไปเริ่มที่ bob ต่อ (จำข้ามข้อความด้วย checkpointer)", talks[2].active === "bob", "ต้อง compile พร้อม checkpointer");
