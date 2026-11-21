import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-16
// routing: ให้ LLM "จัดประเภท" คำถามก่อน แล้วส่งต่อให้ผู้เชี่ยวชาญที่ตรงเรื่อง
const Category = z.enum(["billing", "tech", "other"]);

const State = new StateSchema({
  question: z.string().default(""),
  category: Category.optional(),
  answer: z.string().default(""),
});

const expert = (role: string) => async (state: { question: string }) => ({
  answer: (await llm.invoke(`คุณคือ${role} ตอบสั้น ๆ: ${state.question}`)).text,
});

// เลือก node ปลายทางจากหมวดที่ LLM จัดให้
function routeOf(state: { category?: z.infer<typeof Category> }): "billing" | "tech" | "other" {
  return state.category ?? "other";
}

const graph = new StateGraph(State)
  .addNode("classify", async (state) => {
    const structured = llm.withStructuredOutput(z.object({ category: Category }), { method: "functionCalling" });
    const out = await structured.invoke(`จัดประเภทคำถาม (billing/tech/other): ${state.question}`);
    return { category: out.category };
  })
  .addNode("billing", expert("เจ้าหน้าที่การเงิน"))
  .addNode("tech", expert("ช่างเทคนิค"))
  .addNode("other", expert("ผู้ช่วยทั่วไป"))
  .addEdge(START, "classify")
  .addConditionalEdges("classify", routeOf, ["billing", "tech", "other"])
  .addEdge("billing", END)
  .addEdge("tech", END)
  .addEdge("other", END)
  .compile();

const questions = ["ฉันถูกเก็บเงินซ้ำสองครั้งในใบแจ้งหนี้เดือนนี้", "แอปเด้งออกทุกครั้งที่เปิดหน้าตั้งค่า", "วันนี้วันอะไรของสัปดาห์นะ"];
const results = [];
for (const question of questions) {
  const r = await graph.invoke({ question });
  results.push(r);
  console.log(`[${r.category}] ${question}\n   -> ${r.answer.slice(0, 80)}`);
}












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("router: ไม่มีหมวดใช้ other", routeOf({}) === "other", "state.category ?? \"other\"");
check("router: ใช้หมวดที่ LLM จัดให้", routeOf({ category: "tech" }) === "tech");
check("เรื่องเงินถูกจัดเป็น billing", results[0].category === "billing", "ดู prompt ของ classify");
check("เรื่องแอปเสียถูกจัดเป็น tech", results[1].category === "tech");
check("ทุกคำถามได้คำตอบจากผู้เชี่ยวชาญ", results.every((r) => r.answer.length > 0), "ต่อ edge จากทุกผู้เชี่ยวชาญไป END");
