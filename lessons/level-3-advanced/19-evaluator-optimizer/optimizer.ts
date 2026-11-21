import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-19
// evaluator-optimizer: LLM ตัวหนึ่งเขียน อีกตัว (ที่นี่คือ LLM ตัวเดิมที่รับบทผู้ตรวจ) ตรวจและให้ข้อติ วนปรับจนผ่านหรือครบรอบ
const MAX_ROUNDS = 3;

const State = new StateSchema({
  topic: z.string().default(""),
  draft: z.string().default(""),
  feedback: z.string().default(""),
  approved: z.boolean().default(false),
  round: z.number().default(0),
});

const graph = new StateGraph(State)
  .addNode("generate", async (state) => {
    const prompt = `เขียนประโยคสั้น ๆ เกี่ยวกับ ${state.topic}` + (state.feedback ? `\nแก้ตามข้อติ: ${state.feedback}` : "");
    const reply = await llm.invoke(prompt);
    return { draft: reply.text, round: state.round + 1 };
  })
  .addNode("evaluate", async (state) => {
    const structured = llm.withStructuredOutput(z.object({ approved: z.boolean(), feedback: z.string() }), { method: "functionCalling" });
    const out = await structured.invoke(`ตรวจงานนี้ (ต้องมีตัวอย่างประกอบจึงจะผ่าน): ${state.draft}`);
    return { approved: out.approved, feedback: out.feedback };
  })
  .addEdge(START, "generate")
  .addEdge("generate", "evaluate")
  .addConditionalEdges(
    "evaluate",
    (state) => {
      // 👉 ข้อ 1 คืน END ถ้า state.approved หรือ state.round >= MAX_ROUNDS ไม่เช่นนั้นคืน "generate"
      // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
      //   return state.approved || state.round >= MAX_ROUNDS ? END : "generate";
      return todo(1);
    },
    ["generate", END],
  )
  .compile();

const result = await graph.invoke({ topic: "การดื่มน้ำให้พอ" });
console.log(`วนไป ${result.round} รอบ อนุมัติ=${result.approved}\nร่างสุดท้าย: ${result.draft}\nข้อติล่าสุด: ${result.feedback}`);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check(`วนอย่างน้อย 1 รอบและไม่เกิน ${MAX_ROUNDS} รอบ`, result.round >= 1 && result.round <= MAX_ROUNDS, "หยุดเมื่อ approved หรือครบ MAX_ROUNDS");
check("ได้ร่างที่ไม่ว่าง", result.draft.length > 0);
check("จบเพราะอนุมัติ หรือครบรอบ (ไม่หยุดกลางคัน)", result.approved || result.round === MAX_ROUNDS, "ถ้ายังไม่อนุมัติ ต้องวนต่อจนครบรอบ");
