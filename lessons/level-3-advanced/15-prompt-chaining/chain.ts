import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-15
// prompt chaining: แบ่งงานเป็นขั้น ๆ ให้ LLM ทำทีละอย่าง มี "ด่านตรวจ" (gate) คั่นก่อนไปขั้นถัดไป
const State = new StateSchema({
  topic: z.string().default(""),
  draft: z.string().default(""),
  final: z.string().default(""),
});

// ด่านตรวจ: ร่างยาวพอ (อย่างน้อย 10 ตัวอักษร) ไปขัดเกลาต่อ ไม่งั้นหยุด
function gate(state: { draft: string }): "polish" | "tooShort" {
  // 👉 ข้อ 1 (ด่านตรวจ) คืน "polish" ถ้า state.draft ยาวอย่างน้อย 10 ตัวอักษร ไม่เช่นนั้นคืน "tooShort"
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   return state.draft.length >= 10 ? "polish" : "tooShort";
  return todo(1);
}

const graph = new StateGraph(State)
  .addNode("write", async (state) => {
    const reply = await llm.invoke(`เขียนย่อหน้าเกี่ยวกับ ${state.topic}`);
    return { draft: reply.text };
  })
  .addNode("polish", async (state) => {
    const reply = await llm.invoke(`ขัดเกลาข้อความนี้ให้สละสลวย: ${state.draft}`);
    return { final: reply.text };
  })
  .addNode("tooShort", () => ({ final: "ร่างสั้นเกินไป" }))
  .addEdge(START, "write")
  .addConditionalEdges("write", gate, ["polish", "tooShort"])
  .addEdge("polish", END)
  .addEdge("tooShort", END)
  .compile();

const result = await graph.invoke({ topic: "ประโยชน์ของการออกกำลังกาย" });
console.log("--- ร่าง ---\n" + result.draft);
console.log("\n--- ฉบับขัดเกลา ---\n" + result.final);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ด่านตรวจ: ร่างสั้นเกินไปถูกหยุด", gate({ draft: "สั้น" }) === "tooShort", "ยาวน้อยกว่า 10 ตัวอักษร");
check("ด่านตรวจ: ร่างยาวพอไปขัดเกลา (ขอบเขต 10 ตัวอักษร)", gate({ draft: "ก".repeat(10) }) === "polish");
check("LLM เขียนร่างได้", result.draft.length > 0, "node write ต้องคืน { draft }");
check("ผ่านด่านแล้วได้ฉบับขัดเกลาที่ไม่ใช่ข้อความเดียวกับร่าง", result.final.length > 0 && result.final !== result.draft && result.final !== "ร่างสั้นเกินไป", "node polish ต้องคืน { final }");
