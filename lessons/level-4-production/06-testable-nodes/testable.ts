import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { todo } from "@src/todo";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-06
// โค้ดที่ทดสอบง่าย: แยก "ตรรกะล้วน" ออกจาก "การเรียกโมเดล" และรับโมเดลเข้ามา (ไม่ import ตายตัว) จะส่งโมเดลปลอมเข้าไปตรวจได้
const State = new StateSchema({
  text: z.string().default(""),
  summary: z.string().default(""),
});

// ตรรกะล้วน ๆ (ไม่เรียกโมเดล): ตัดช่องว่างหัวท้าย และยุบช่องว่างซ้อนให้เหลือช่องเดียว
function cleanText(text: string): string {
  // 👉 ข้อ 1: คืน text.trim().replace(/\s+/g, " ")
  return todo(1);
}

// node ที่รับโมเดลเข้ามา (ไม่ import โมเดลตายตัว)
function makeSummarizeNode(model: BaseChatModel) {
  return async (state: { text: string }) => {
    // 👉 ข้อ 2: เรียก model.invoke(`สรุปสั้น ๆ: ${state.text}`) แล้วคืน { summary: ผล.text }
    return todo(2);
  };
}

function buildPipeline(model: BaseChatModel) {
  const builder = new StateGraph(State).addNode("clean", (state) => ({ text: cleanText(state.text) }));
  // 👉 ข้อ 3: เพิ่ม node "summarize" ด้วย makeSummarizeNode(model) แล้วต่อ START → clean → summarize → END
  //          จากนั้นคืน builder.compile()
  return todo(3);
}

// ทดสอบสามชั้นด้วยโมเดลปลอมที่ตอบตามสคริปต์ (เร็ว ฟรี ผลเหมือนเดิมทุกครั้ง)
const nodeModel = fakeToolLLM(["สรุปแล้ว"]);
const nodeResult = await makeSummarizeNode(nodeModel)({ text: "ข้อความยาว" });
const graphModel = fakeToolLLM(["ย่อ"]);
const graphResult = await buildPipeline(graphModel).invoke({ text: "  a   b  " });

// แล้วค่อยใช้โมเดลจริงกับ graph เดียวกัน
const real = await buildPipeline(llm).invoke({ text: "  LangGraph   เป็นไลบรารี  สำหรับสร้าง agent \n เป็นกราฟ  " });
console.log("โมเดลจริงสรุป:", real.summary);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ชั้นตรรกะล้วน: cleanText ไม่ต้องใช้โมเดลเลย", cleanText("  สวัสดี   ชาว  โลก \n") === "สวัสดี ชาว โลก");
check("ชั้น node เดี่ยว: ส่ง State เข้าตรง ๆ ได้ { summary }", nodeResult.summary === "สรุปแล้ว" && nodeModel.calls[0][0].text === "สรุปสั้น ๆ: ข้อความยาว", "คืน { summary: ผล.text }");
check("ชั้น graph: ทำความสะอาดก่อน แล้วโมเดลเห็นข้อความที่สะอาดแล้ว", graphResult.summary === "ย่อ" && graphModel.calls[0][0].text === "สรุปสั้น ๆ: a b", "ต่อ clean ก่อน summarize");
check("graph เดียวกันใช้กับโมเดลจริงได้", real.summary.length > 0);
