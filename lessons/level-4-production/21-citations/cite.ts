import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Hit } from "@src/rag";
import { todo } from "@src/todo";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-21
// citations: ให้โมเดลบอก "แหล่งที่มา" ของคำตอบ แต่อย่าเชื่อทันที: กรองเฉพาะแหล่งที่เราส่งให้จริง (โมเดลชอบมั่วชื่อไฟล์) ถ้าเหลือศูนย์แปลว่าไม่มีหลักฐาน
const CitedAnswer = z.object({
  answer: z.string(),
  sources: z.array(z.string()),
});

interface CheckedAnswer {
  answer: string;
  sources: string[];
  grounded: boolean;
}

async function answerWithCitations(model: BaseChatModel, question: string, hits: Hit[]): Promise<CheckedAnswer> {
  const context = hits.map((h) => `[${h.source}] ${h.text}`).join("\n");
  const result: z.infer<typeof CitedAnswer> = await model
    .withStructuredOutput(CitedAnswer, { method: "functionCalling" })
    .invoke(`ตอบจากเอกสารเท่านั้นและระบุไฟล์ที่ใช้ใน sources\n${context}\nคำถาม: ${question}`);

  // 👉 ข้อ 1 กรอง result.sources ให้เหลือเฉพาะที่ตรงกับ source ของ hits จริง (กันการอ้างไฟล์ที่ไม่เคยได้รับ)
  // แนวทาง (เอา // ออกแล้วแทนที่ todo(1) ได้เลย):
  //   const real = new Set(hits.map((h) => h.source));
  //   const sources: string[] = result.sources.filter((s) => real.has(s));
  const sources: string[] = todo(1);

  const grounded: boolean = sources.length > 0;

  return { answer: result.answer, sources, grounded };
}

const hits: Hit[] = [
  { source: "it.md", text: "รีเซ็ตรหัสผ่านที่พอร์ทัล", score: 0.9 },
  { source: "hr.md", text: "ลาป่วยได้ 30 วัน", score: 0.2 },
];
const reply = (answer: string, sources: string[]) => JSON.stringify({ answer, sources });

// ส่วนที่ 1: โมเดลปลอมที่ตอบ JSON ตามสคริปต์ (ตรวจกรณีมั่วอ้างไฟล์)
const okModel = fakeToolLLM([reply("ไปที่พอร์ทัล", ["it.md"])]);
const ok = await answerWithCitations(okModel, "คำถามของฉัน", hits);
const ghost = await answerWithCitations(fakeToolLLM([reply("ตอบ", ["it.md", "ghost.md"])]), "q", hits);
const onlyGhost = await answerWithCitations(fakeToolLLM([reply("ตอบ", ["ghost.md"])]), "q", hits);
const noCite = await answerWithCitations(fakeToolLLM([reply("ตอบ", [])]), "q", hits);
const lookAlike = await answerWithCitations(fakeToolLLM([reply("ตอบ", ["edit.md"])]), "q", hits);
const partial: boolean[] = [];
for (const cited of [["it"], ["md"], [".md"], [""]]) {
  partial.push((await answerWithCitations(fakeToolLLM([reply("ตอบ", cited)]), "q", hits)).grounded);
}

// ส่วนที่ 2: โมเดลจริง
const real = await answerWithCitations(llm, "ลืมรหัสผ่านต้องทำอย่างไร", hits);
console.log(real);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("อ้างแหล่งที่มีจริง: ผ่าน และ grounded", ok.answer === "ไปที่พอร์ทัล" && JSON.stringify(ok.sources) === '["it.md"]' && ok.grounded, "sources ที่ผ่านการกรอง และ grounded = sources.length > 0");
check("โมเดลเห็นที่มาของทุกชิ้นใน prompt", okModel.calls[0][0].text.includes("[it.md] รีเซ็ตรหัสผ่านที่พอร์ทัล") && okModel.calls[0][0].text.includes("[hr.md]") && okModel.calls[0][0].text.includes("คำถามของฉัน"));
check("โมเดลมั่วอ้างไฟล์ที่ไม่เคยได้รับ: ถูกกรองออก เหลือของจริง", JSON.stringify(ghost.sources) === '["it.md"]' && ghost.grounded);
check("อ้างแต่ไฟล์ที่ไม่มีจริง หรือไม่อ้างเลย: ไม่มีหลักฐาน (grounded false)", !onlyGhost.grounded && !noCite.grounded);
check("ชื่อไฟล์ที่ลงท้ายคล้ายกันไม่นับ (edit.md ไม่ใช่ it.md)", lookAlike.sources.length === 0 && !lookAlike.grounded, "เทียบชื่อแบบตรงเป๊ะ ไม่ใช่ endsWith");
check("ชื่อที่เป็นแค่ส่วนหนึ่งของชื่อไฟล์หรือว่างเปล่าไม่นับ", partial.every((g) => g === false));
check("โมเดลจริง: ได้คำตอบ และแหล่งที่อ้างอยู่ในชุดที่ส่งให้เท่านั้น", real.answer.length > 0 && real.sources.every((s) => hits.some((h) => h.source === s)));
