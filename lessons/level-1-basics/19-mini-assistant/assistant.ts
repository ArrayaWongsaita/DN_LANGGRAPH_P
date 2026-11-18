import { todo } from "@src/todo";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 19
// โปรเจกต์ปิด Level 1: ผู้ช่วยที่ "จัดประเภทข้อความก่อน แล้วเลือกทางตอบ"
//
//   START ──► classify ──?──► smallTalk ──► END      (ทักทาย: ตอบสำเร็จรูป ไม่เปลือง LLM)
//                        └──► respond   ──► END      (คำถามทั่วไป: ให้ LLM ตอบ)
//
// บทนี้รวมของที่เรียนมา: structured output (08), node ที่เรียก LLM (12),
// conditional edge (14), edge ไป END (11) ลองเขียนจากโครงนี้ทีละขั้น

const State = new StateSchema({
  question: z.string(),
  category: z.string().default(""),
  answer: z.string().default(""),
});
type AssistantState = typeof State.State;

const categorySchema = z.object({ category: z.enum(["greeting", "question"]) });

// router: ดู category แล้วเลือก node ถัดไป
function pickRoute(state: Pick<AssistantState, "category">): "smallTalk" | "respond" {
  // 👉 ข้อ 1: ถ้า category เป็น "greeting" ให้คืน "smallTalk" นอกนั้นคืน "respond"
  return todo(1);
}

check("pickRoute: greeting -> smallTalk", pickRoute({ category: "greeting" }) === "smallTalk", "เทียบ state.category กับ 'greeting'");
check("pickRoute: อย่างอื่น -> respond", pickRoute({ category: "question" }) === "respond");

const graph = new StateGraph(State)
  .addNode("classify", async (state) => {
    // 👉 ข้อ 2: ให้ LLM จัดประเภทข้อความ state.question เป็น "greeting" หรือ "question"
    //          ใช้ llm.withStructuredOutput(categorySchema) แล้ว invoke ด้วยข้อความที่มี state.question
    //          (เช่น `จัดประเภทข้อความนี้: ${state.question}`) จากนั้นคืน update { category: ผลที่ได้ }
    return todo(2);
  })
  .addNode("smallTalk", () => ({ answer: "สวัสดีค่ะ มีอะไรให้ช่วยไหมคะ" }))
  .addNode("respond", async (state) => {
    // 👉 ข้อ 3: ส่ง state.question ให้ llm ตอบ แล้วคืน update { answer: ข้อความตอบ }
    return todo(3);
  });

graph.addEdge(START, "classify");

// 👉 ข้อ 4: จาก "classify" ให้เลือกทางด้วย pickRoute (ปลายทางที่เป็นไปได้คือ "smallTalk" และ "respond")
todo(4);

// 👉 ข้อ 5: ต่อทั้ง "smallTalk" และ "respond" ไปที่ END
todo(5);

const app = graph.compile();
for (const question of ["สวัสดี", "LangGraph คืออะไร ตอบสั้น ๆ หนึ่งประโยค"]) {
  const result = await app.invoke({ question });
  console.log(`[${result.category}] ${result.answer}`);
  check(`"${question}" ได้หมวดหมู่และคำตอบ`, result.category !== "" && result.answer !== "", "ต่อ edge ให้ครบทุกทางไปถึง END");
}
