import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../../02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 20
// โปรเจกต์ปิด Level 1: ผู้ช่วยที่ "จัดประเภทข้อความก่อน แล้วเลือกทางตอบ"
//
//   START ──► classify ──?──► smallTalk ──► END      (ทักทาย: ตอบสำเร็จรูป ไม่เปลือง LLM)
//                        └──► respond   ──► END      (คำถามทั่วไป: ให้ LLM ตอบ)
//
// บทนี้รวมของที่เรียนมา: structured output (09), node ที่เรียก LLM (13),
// conditional edge (15), edge ไป END (12) ลองเขียนจากโครงนี้ทีละขั้น

const State = new StateSchema({
  question: z.string(),
  category: z.string().default(""),
  answer: z.string().default(""),
});
type AssistantState = typeof State.State;

const categorySchema = z.object({ category: z.enum(["greeting", "question"]) });

// router: ดู category แล้วเลือก node ถัดไป
function pickRoute(state: Pick<AssistantState, "category">): "smallTalk" | "respond" {
  // ข้อ 1: ถ้า category เป็น "greeting" ให้คืน "smallTalk" นอกนั้นคืน "respond"
  return state.category === "greeting" ? "smallTalk" : "respond";
}

const graph = new StateGraph(State)
  .addNode("classify", async (state) => {
    // ข้อ 2: ให้ LLM จัดประเภทข้อความ state.question เป็น "greeting" หรือ "question"
    const classifier = llm.withStructuredOutput(categorySchema, { method: "functionCalling" });
    const result = await classifier.invoke(`จัดประเภทข้อความนี้: ${state.question}`);
    return { category: result.category };
  })
  .addNode("smallTalk", () => ({ answer: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ" }))
  .addNode("respond", async (state) => {
    // ข้อ 3: ส่ง state.question ให้ llm ตอบ แล้วคืน update { answer: ข้อความตอบ }
    const reply = await llm.invoke(state.question);
    return { answer: reply.text };
  });

graph.addEdge(START, "classify");

// ข้อ 4: จาก "classify" ให้เลือกทางด้วย pickRoute (ปลายทางที่เป็นไปได้คือ "smallTalk" และ "respond")
graph.addConditionalEdges("classify", pickRoute, ["smallTalk", "respond"]);

// ข้อ 5: ต่อทั้ง "smallTalk" และ "respond" ไปที่ END
graph.addEdge("smallTalk", END);
graph.addEdge("respond", END);

const app = graph.compile();
const questions = ["สวัสดี", "LangGraph คืออะไร ตอบสั้น ๆ หนึ่งประโยค"];
const results: { category: string; answer: string }[] = [];
for (const question of questions) {
  const result = await app.invoke({ question });
  results.push(result);
  console.log(`[${result.category}] ${result.answer}`);
}

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("pickRoute: greeting -> smallTalk", pickRoute({ category: "greeting" }) === "smallTalk", "เทียบ state.category กับ 'greeting'");
check("pickRoute: อย่างอื่น -> respond", pickRoute({ category: "question" }) === "respond");
results.forEach((result, i) =>
  check(`"${questions[i]}" ได้หมวดหมู่และคำตอบ`, result.category !== "" && result.answer !== "", "ต่อ edge ให้ครบทุกทางไปถึง END"),
);
