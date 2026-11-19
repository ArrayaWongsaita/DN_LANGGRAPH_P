import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 3-17
// parallelization: งานตรวจสามอย่างไม่ขึ้นต่อกัน จึงให้ทำ "พร้อมกัน" แล้วรอรวมผลที่ node ท้าย
const State = new StateSchema({
  text: z.string().default(""),
  safety: z.string().default(""),
  tone: z.string().default(""),
  length: z.string().default(""),
  report: z.string().default(""),
});

const builder = new StateGraph(State)
  .addNode("checkSafety", async (s) => ({ safety: (await llm.invoke(`ตรวจความปลอดภัยของข้อความนี้ ตอบสั้นมาก: ${s.text}`)).text }))
  .addNode("checkTone", async (s) => ({ tone: (await llm.invoke(`ตรวจน้ำเสียงของข้อความนี้ ตอบสั้นมาก: ${s.text}`)).text }))
  .addNode("checkLength", async (s) => ({ length: (await llm.invoke(`ตรวจความยาวของข้อความนี้ ตอบสั้นมาก: ${s.text}`)).text }))
  .addNode("makeReport", (s) => {
    // ข้อ 2: คืน { report: `${s.safety} | ${s.tone} | ${s.length}` }
    return { report: `${s.safety} | ${s.tone} | ${s.length}` };
  });

// ข้อ 1: เพิ่ม edge จาก START ไปทั้ง 3 node ตรวจ และจากทั้ง 3 node ไป "makeReport" (builder.addEdge หลายครั้ง)
for (const node of ["checkSafety", "checkTone", "checkLength"] as const) {
  builder.addEdge(START, node);
  builder.addEdge(node, "makeReport");
}

const graph = builder.addEdge("makeReport", END).compile();
const started = Date.now();
const result = await graph.invoke({ text: "สินค้าชิ้นนี้ดีมาก ส่งไวและแพ็กแน่น แนะนำเลยครับ" });
console.log(`ใช้เวลา ${Date.now() - started} ms`);
console.log(result.report);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ทั้งสามตัวตรวจทำงาน (ได้ผลทั้ง safety tone length)", result.safety.length > 0 && result.tone.length > 0 && result.length.length > 0, "ต่อ START ไปทั้งสาม node");
check("makeReport รอรวมผลครบทั้งสาม (มีตัวคั่น | สองตัว)", result.report.split(" | ").length === 3, "ต่อทั้งสาม node ไป makeReport");
