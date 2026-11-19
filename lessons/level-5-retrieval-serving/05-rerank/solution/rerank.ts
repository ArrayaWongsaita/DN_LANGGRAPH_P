import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 5-05
// rerank: การค้นรอบแรกได้ผู้สมัครกว้าง ๆ แล้วให้โมเดลอ่านทีละชิ้นและให้คะแนนความเกี่ยวข้อง คัดเอาเฉพาะที่ผ่านเกณฑ์ เรียงใหม่ ตัดเหลือ topN (แพงกว่าการค้นรอบแรก จึงทำกับชุดเล็กเท่านั้น)
interface Candidate {
  id: string;
  text: string;
}

function buildRerankPrompt(query: string, candidates: Candidate[]): string {
  // ข้อ 1: คืนข้อความที่มีคำถามและเอกสารเรียงเป็นบรรทัด `${เลขที่เริ่มจาก 1}. ${text}` ทุกอัน
  //          และบอกให้ให้คะแนนความเกี่ยวข้อง 0-10 ต่อเอกสาร ส่งกลับเป็น scores ตามลำดับเอกสาร
  const list = candidates.map((c, i) => `${i + 1}. ${c.text}`).join("\n");
  return `คำถาม: ${query}\nเอกสาร:\n${list}\nให้คะแนนความเกี่ยวข้อง 0-10 ต่อเอกสาร ส่งกลับเป็น scores ตามลำดับเอกสาร`;
}

async function rerank(
  model: BaseChatModel,
  query: string,
  candidates: Candidate[],
  options: { topN: number; minScore: number },
): Promise<Candidate[]> {
  if (candidates.length === 0) return []; // ไม่มีอะไรให้จัด ไม่ต้องเรียกโมเดล
  const result = await model
    .withStructuredOutput(z.object({ scores: z.array(z.number()) }), { method: "functionCalling" })
    .invoke(buildRerankPrompt(query, candidates));

  // ข้อ 2: ถ้า result.scores.length ไม่เท่ากับจำนวน candidates (โมเดลตอบผิดรูป) ให้ถอยกลับ:
  //          คืน candidates.slice(0, options.topN) ตามลำดับเดิม โดยไม่กรองและไม่เรียงใหม่
  if (result.scores.length !== candidates.length) return candidates.slice(0, options.topN);

  // ข้อ 3: จับคู่ candidate กับคะแนนตามตำแหน่ง เก็บเฉพาะที่คะแนน >= options.minScore
  //          เรียงคะแนนมากไปน้อย (เท่ากันคงลำดับเดิม) แล้วเอา options.topN อันแรก คืนเป็น Candidate
  return candidates
    .map((candidate, index) => ({ candidate, index, score: result.scores[index] }))
    .filter((s) => s.score >= options.minScore)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, options.topN)
    .map((s) => s.candidate);
}

const cands: Candidate[] = [
  { id: "a", text: "เรื่องคืนเงิน" },
  { id: "b", text: "เรื่องรีเซ็ตรหัสผ่าน" },
  { id: "c", text: "เรื่องลาป่วย" },
  { id: "d", text: "เรื่องรหัสผ่านและ VPN" },
];
const scores = (...s: number[]) => JSON.stringify({ scores: s });
const ids = (list: Candidate[]) => list.map((c) => c.id).join("");

// ส่วนที่ 1: โมเดลปลอมที่ให้คะแนนตามสคริปต์
const prompt = buildRerankPrompt("ลืมรหัสผ่าน", cands);
const sorted = await rerank(fakeToolLLM([scores(1, 9, 2, 8)]), "รหัสผ่าน", cands, { topN: 2, minScore: 0 });
const cutoff = await rerank(fakeToolLLM([scores(1, 9, 5, 5)]), "q", cands, { topN: 10, minScore: 5 });
const ties = await rerank(fakeToolLLM([scores(7, 7, 7, 7)]), "q", cands, { topN: 4, minScore: 0 });
const fallback = await rerank(fakeToolLLM([scores(9, 1)]), "q", cands, { topN: 3, minScore: 5 });
const idle = fakeToolLLM(["ไม่ควรถูกเรียก"]);
const emptyOut = await rerank(idle, "q", [], { topN: 3, minScore: 0 });
const spy = fakeToolLLM([scores(1, 2, 3, 4)]);
await rerank(spy, "คำถามพิเศษ", cands, { topN: 1, minScore: 0 });

// ส่วนที่ 2: โมเดลจริงให้คะแนนจริง
const real = await rerank(llm, "ลืมรหัสผ่านต้องทำยังไง", cands, { topN: 2, minScore: 5 });
console.log("โมเดลจริงเลือก:", real.map((c) => c.text));

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("พรอมต์: มีคำถาม เอกสารเรียงหมายเลขตั้งแต่ 1 และบอกช่วงคะแนน", prompt.includes("ลืมรหัสผ่าน") && prompt.includes("1. เรื่องคืนเงิน") && prompt.includes("4. เรื่องรหัสผ่านและ VPN") && prompt.includes("0-10"));
check("เรียงใหม่ตามคะแนนมากไปน้อย และตัดตาม topN", ids(sorted) === "bd");
check("ตัดอันที่คะแนนต่ำกว่าเกณฑ์ (เท่ากับเกณฑ์ผ่าน)", ids(cutoff) === "bcd", "เก็บเฉพาะ score >= minScore");
check("คะแนนเท่ากันคงลำดับเดิมของผู้สมัคร", ids(ties) === "abcd");
check("คะแนนจำนวนไม่ตรง: ถอยกลับไปลำดับเดิม ไม่กรอง ไม่เรียงใหม่ (ยังตัดตาม topN)", ids(fallback) === "abc");
check("ไม่มีผู้สมัคร: ไม่เรียกโมเดล", emptyOut.length === 0 && idle.calls.length === 0);
check("โมเดลได้รับพรอมต์ที่สร้างจากฟังก์ชันของคุณ", spy.calls[0][0].text === buildRerankPrompt("คำถามพิเศษ", cands));
check("โมเดลจริง: เลือกเอกสารเรื่องรหัสผ่านและตัดเรื่องคืนเงิน/ลาป่วยออก", real.length >= 1 && real.length <= 2 && real.every((c) => c.id === "b" || c.id === "d"));
