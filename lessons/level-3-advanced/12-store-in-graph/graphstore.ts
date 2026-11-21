import { END, InMemoryStore, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-12  (ไม่ใช้ LLM)
// ใน node เข้าถึง store ได้ผ่าน runtime.store และรู้ว่าใครคุยอยู่จาก runtime.context (ส่งตอน invoke)
const State = new StateSchema({
  text: z.string().default(""),
  reply: z.string().default(""),
});
const store = new InMemoryStore();

const graph = new StateGraph(State, { context: z.object({ userId: z.string() }) })
  .addNode("respond", async (state, runtime) => {
    const userId = runtime.context!.userId;
    const ns = ["profiles", userId];
    if (state.text.startsWith("จำชื่อ:")) {
      const name = state.text.slice("จำชื่อ:".length).trim();
      // 👉 ข้อ 1 เก็บชื่อ: await runtime.store!.put(ns, "name", { name })
      // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
      //   await runtime.store!.put(ns, "name", { name });
      todo(1);
      return { reply: `ยินดีที่รู้จัก ${name}` };
    }
    const item = await runtime.store!.get(ns, "name");
    return { reply: item ? `คุณชื่อ ${item.value.name}` : "ยังไม่รู้จักชื่อคุณ" };
  })
  .addEdge(START, "respond")
  .addEdge("respond", END)
  .compile({ store });

const replies: string[] = [];
for (const [userId, text] of [["mali", "จำชื่อ: มาลี"], ["mali", "ฉันชื่ออะไร"], ["somchai", "ฉันชื่ออะไร"]]) {
  replies.push((await graph.invoke({ text }, { context: { userId } })).reply);
}
console.log(replies);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("จำชื่อแล้วตอบรับ", replies[0] === "ยินดีที่รู้จัก มาลี");
check("ถามภายหลัง (คนละ invoke) ยังจำได้", replies[1] === "คุณชื่อ มาลี", "store เก็บข้ามการเรียก invoke");
check("ผู้ใช้อีกคนไม่เห็นชื่อของมาลี", replies[2] === "ยังไม่รู้จักชื่อคุณ", "namespace ต้องมี userId");
