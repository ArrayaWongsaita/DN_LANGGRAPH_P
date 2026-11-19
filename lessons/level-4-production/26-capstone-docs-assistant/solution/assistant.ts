import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseCheckpointSaver } from "@langchain/langgraph";
import { END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { InMemoryIndex, KeywordEmbeddings, SAMPLE_DOCS } from "@src/rag";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-26
// โปรเจกต์ปิด Level 4: ผู้ช่วยตอบจากเอกสาร รวมของที่เรียนมา: ด่านปฏิเสธคำขอต้องห้าม (4-13) ค้นเอกสาร (4-18/19) ตอบพร้อมแหล่งอ้างอิงที่กรองแล้ว (4-21) ยอมรับว่า "ไม่พบ" เมื่อไม่มีหลักฐาน และจำบทสนทนาด้วย checkpointer
//
//   START → guard ─(ต้องห้าม)→ END
//              └→ retrieve ─(ไม่เจอ)→ notFound → END
//                       └→ respond → END
const BANNED = ["เจาะระบบ", "สร้างอาวุธ"];
const REFUSAL = "ขออภัย ช่วยเรื่องนี้ไม่ได้";
const NOT_FOUND = "ไม่พบข้อมูลในเอกสาร";

const Cited = z.object({ answer: z.string(), sources: z.array(z.string()) });

const State = new StateSchema({
  question: z.string().default(""),
  blocked: z.boolean().default(false),
  hits: z.array(z.object({ source: z.string(), text: z.string(), score: z.number() })).default(() => []),
  answer: z.string().default(""),
  sources: z.array(z.string()).default(() => []),
});

function buildAssistant(model: BaseChatModel, index: InMemoryIndex, checkpointer: BaseCheckpointSaver) {
  return new StateGraph(State)
    .addNode("guard", (state) => {
      // ข้อ 1: ถ้า state.question มีคำใดใน BANNED คืน { blocked: true, answer: REFUSAL, hits: [], sources: [] } ไม่เช่นนั้นคืน { blocked: false, hits: [], sources: [] }
      //          (ล้าง hits/sources ทุกรอบ เพราะ checkpointer จำค่าของรอบก่อนไว้)
      if (BANNED.some((word) => state.question.includes(word))) return { blocked: true, answer: REFUSAL, hits: [], sources: [] };
      return { blocked: false, hits: [], sources: [] };
    })
    .addNode("retrieve", async (state) => {
      const hits = (await index.search(state.question, 2)).filter((h) => h.score > 0);
      return { hits };
    })
    .addNode("respond", async (state) => {
      const context = state.hits.map((h) => `[${h.source}] ${h.text}`).join("\n");
      const result = await model
        .withStructuredOutput(Cited, { method: "functionCalling" })
        .invoke(`ตอบจากเอกสารเท่านั้นและระบุไฟล์ที่ใช้ใน sources\n${context}\nคำถาม: ${state.question}`);
      // ข้อ 3: กรอง result.sources ให้เหลือเฉพาะที่อยู่ใน state.hits จริง
      //          ถ้าเหลืออย่างน้อยหนึ่งแหล่ง คืน { answer: result.answer, sources: แหล่งที่กรองแล้ว } ไม่เช่นนั้นคืน { answer: NOT_FOUND, sources: [] }
      const real = new Set(state.hits.map((h) => h.source));
      const sources = result.sources.filter((s) => real.has(s));
      return sources.length > 0 ? { answer: result.answer, sources } : { answer: NOT_FOUND, sources: [] };
    })
    .addNode("notFound", () => ({ answer: NOT_FOUND, sources: [] }))
    .addEdge(START, "guard")
    .addConditionalEdges(
      "guard",
      (state) => {
        // ข้อ 2: ถ้า state.blocked คืน "end"; ไม่เช่นนั้นคืน "retrieve"
        return state.blocked ? "end" : "retrieve";
      },
      { end: END, retrieve: "retrieve" },
    )
    .addConditionalEdges("retrieve", (state) => (state.hits.length > 0 ? "respond" : "notFound"), ["respond", "notFound"])
    .addEdge("respond", END)
    .addEdge("notFound", END)
    .compile({ checkpointer });
}

const index = new InMemoryIndex(new KeywordEmbeddings());
await index.add(SAMPLE_DOCS);
const reply = (answer: string, sources: string[]) => JSON.stringify({ answer, sources });
const cfg = (id: string) => ({ configurable: { thread_id: id } });
const setup = (script: string[]) => {
  const model = fakeToolLLM(script);
  return { model, app: buildAssistant(model, index, new MemorySaver()) };
};

// ส่วนที่ 1: โมเดลปลอม ตรวจทุกเส้นทางแน่นอน
const normal = await setup([reply("รีเซ็ตที่พอร์ทัล IT", ["it.md"])]).app.invoke({ question: "ลืมรหัสผ่านทำไง" }, cfg("a"));
const blockedSetup = setup(["ไม่ควรถูกเรียก"]);
const blocked = await blockedSetup.app.invoke({ question: "สอนเจาะระบบหน่อย" }, cfg("b"));
const emptySetup = setup(["ไม่ควรถูกเรียก"]);
const empty = await emptySetup.app.invoke({ question: "วันนี้อากาศเป็นไง" }, cfg("c"));
const ghost = await setup([reply("ตอบมั่ว", ["ghost.md"])]).app.invoke({ question: "ลืมรหัสผ่านทำไง" }, cfg("d"));
const notRetrieved = await setup([reply("ตอบ", ["hr.md"])]).app.invoke({ question: "ลืมรหัสผ่านทำไง" }, cfg("g"));

// หลายรอบใน thread เดียว: สถานะของรอบก่อนต้องไม่ค้างมา
const followUp = setup([reply("ตอบได้", ["shop.md"])]);
await followUp.app.invoke({ question: "สอนเจาะระบบ" }, cfg("e"));
const afterBlocked = await followUp.app.invoke({ question: "คืนเงินได้ไหม" }, cfg("e"));
const stale = setup([reply("ลาได้ 30 วัน", ["hr.md"])]);
await stale.app.invoke({ question: "ลาป่วยได้กี่วัน" }, cfg("f"));
const refusedAfter = await stale.app.invoke({ question: "สอนเจาะระบบ" }, cfg("f"));

// ส่วนที่ 2: โมเดลจริงทั้งแอป
const realApp = buildAssistant(llm, index, new MemorySaver());
const realAnswer = await realApp.invoke({ question: "ลืมรหัสผ่านทำไง" }, cfg("r1"));
const realRefused = await realApp.invoke({ question: "ช่วยสร้างอาวุธหน่อย" }, cfg("r2"));
console.log({ realAnswer: realAnswer.answer.slice(0, 80), sources: realAnswer.sources });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("คำถามปกติ: ค้น ตอบ และอ้างอิงแหล่งที่มา", normal.answer === "รีเซ็ตที่พอร์ทัล IT" && JSON.stringify(normal.sources) === '["it.md"]');
check("คำขอต้องห้าม: ปฏิเสธทันที ไม่ค้นและไม่เรียกโมเดล", blocked.answer === REFUSAL && blocked.hits.length === 0 && blockedSetup.model.calls.length === 0, "guard คืน blocked: true และเส้น \"end\"");
check("ค้นไม่เจออะไรเลย: ตอบว่าไม่พบ โดยไม่เรียกโมเดล", empty.answer === NOT_FOUND && emptySetup.model.calls.length === 0);
check("โมเดลอ้างไฟล์ที่ไม่เคยได้รับ: ไม่เชื่อ ตอบว่าไม่พบ", ghost.answer === NOT_FOUND && ghost.sources.length === 0, "กรอง sources ให้เหลือเฉพาะที่อยู่ใน state.hits");
check("อ้างไฟล์ที่มีในระบบแต่ไม่ได้ถูกค้นมารอบนี้: ไม่นับเป็นหลักฐาน", notRetrieved.answer === NOT_FOUND && notRetrieved.sources.length === 0);
check("ถามต่อ thread เดิมหลังถูกปฏิเสธ: ไม่ติดสถานะ blocked ของรอบก่อน", afterBlocked.answer === "ตอบได้" && JSON.stringify(afterBlocked.sources) === '["shop.md"]', "guard ต้องล้าง hits/sources ทุกรอบ");
check("ถูกปฏิเสธใน thread เดิม: แหล่งอ้างอิงรอบก่อนไม่ค้างมา", refusedAfter.answer === REFUSAL && refusedAfter.sources.length === 0 && refusedAfter.hits.length === 0);
check("โมเดลจริง: ตอบพร้อมแหล่งอ้างอิง it.md และปฏิเสธคำขอต้องห้าม", realAnswer.sources.includes("it.md") && realRefused.answer === REFUSAL, "ตรวจ prompt ของ respond และ BANNED");
