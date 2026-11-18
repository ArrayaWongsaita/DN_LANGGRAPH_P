import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../../02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 13
const State = new StateSchema({
  topic: z.string(),
  draft: z.string().default(""),
  final: z.string().default(""),
});

// เขียนร่าง แล้วให้ LLM อีกรอบปรับปรุง (ผลของขั้นแรกส่งต่อให้ขั้นที่สองผ่าน state)
const graph = new StateGraph(State)
  .addNode("writeDraft", async (state) => {
    const reply = await llm.invoke(`เขียนย่อหน้าสั้น ๆ เกี่ยวกับ: ${state.topic}`);
    return { draft: reply.text };
  })
  .addNode("improve", async (state) => {
    // ข้อ 1: ส่งร่าง (state.draft) ให้ LLM ปรับปรุง แล้วเก็บผลลง field "final"
    const reply = await llm.invoke(`ปรับปรุงข้อความนี้ให้ดีขึ้น: ${state.draft}`);
    return { final: reply.text };
  });

// ข้อ 2: ต่อ START -> "writeDraft" -> "improve" -> END
graph.addEdge(START, "writeDraft");
graph.addEdge("writeDraft", "improve");
graph.addEdge("improve", END);

const result = await graph.compile().invoke({ topic: "ประโยชน์ของการนอนหลับ" });
console.log("--- ร่าง ---\n" + result.draft);
console.log("\n--- ฉบับปรับปรุง ---\n" + result.final);
check("มีร่างจากขั้นแรก", result.draft.length > 0, "ต่อ START -> writeDraft ด้วย addEdge");
check("มีฉบับปรับปรุงจากขั้นที่สอง", result.final.length > 0, "ต่อ writeDraft -> improve -> END และเก็บผลลง final");
check("ฉบับปรับปรุงไม่ใช่ข้อความเดียวกับร่าง", result.final !== result.draft, "improve ต้องเรียก LLM ใหม่");
