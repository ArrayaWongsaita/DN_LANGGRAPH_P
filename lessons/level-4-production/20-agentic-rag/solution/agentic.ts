import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { InMemoryIndex, KeywordEmbeddings, SAMPLE_DOCS } from "@src/rag";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-20
// agentic RAG: ค้น แล้วให้โมเดล "ให้คะแนน" ว่าเอกสารเกี่ยวข้องไหม ถ้าไม่ ให้เขียนคำค้นใหม่แล้วค้นอีกรอบ (จำกัดรอบ) ถ้ายังไม่เจอก็ยอมรับว่าไม่พบ ไม่แต่งคำตอบ
const MAX_REWRITES = 1;

const State = new StateSchema({
  question: z.string().default(""),
  query: z.string().default(""),
  docs: z.string().default(""),
  relevant: z.boolean().default(false),
  rewrites: z.number().default(0),
  answer: z.string().default(""),
});

function buildAgenticRag(model: BaseChatModel, index: InMemoryIndex) {
  return new StateGraph(State)
    .addNode("retrieve", async (state) => {
      const query = state.query || state.question;
      const hits = await index.search(query, 1);
      return { query, docs: hits.map((h) => `[${h.source}] ${h.text}`).join("\n") };
    })
    .addNode("grade", async (state) => {
      const verdict = await model
        .withStructuredOutput(z.object({ relevant: z.boolean() }), { method: "functionCalling" })
        .invoke(`คำถาม: ${state.question}\nเอกสาร: ${state.docs}\nเอกสารนี้ตอบคำถามได้ไหม`);
      return { relevant: verdict.relevant };
    })
    .addNode("rewrite", async (state) => {
      const reply = await model.invoke(`เขียนคำค้นใหม่ให้ตรงศัพท์ในเอกสารมากขึ้น: ${state.question}`);
      return { query: reply.text, rewrites: state.rewrites + 1 };
    })
    .addNode("generate", async (state) => {
      const prompt = `ตอบคำถามจากเอกสารนี้เท่านั้น\nเอกสาร: ${state.docs}\nคำถาม: ${state.question}`;
      return { answer: (await model.invoke(prompt)).text };
    })
    .addNode("giveUp", () => ({ answer: "ไม่พบข้อมูลในเอกสาร" }))
    .addEdge(START, "retrieve")
    .addEdge("retrieve", "grade")
    .addConditionalEdges(
      "grade",
      (state) => {
        if (state.relevant) return "generate";
        return state.rewrites < MAX_REWRITES ? "rewrite" : "giveUp";
      },
      ["generate", "rewrite", "giveUp"],
    )
    .addEdge("rewrite", "retrieve")
    .addEdge("generate", END)
    .addEdge("giveUp", END)
    .compile();
}

const index = new InMemoryIndex(new KeywordEmbeddings());
await index.add(SAMPLE_DOCS);
const verdict = (relevant: boolean) => JSON.stringify({ relevant });

// ส่วนที่ 1: โมเดลปลอมตามสคริปต์ (ให้คะแนน แล้ว ตอบ / เขียนคำค้นใหม่ แล้ว ...) ตรวจทุกเส้นทางแน่นอน
const directModel = fakeToolLLM([verdict(true), "ไปรีเซ็ตที่พอร์ทัล"]);
const direct = await buildAgenticRag(directModel, index).invoke({ question: "ลืมรหัสผ่านทำไง" });
const retryModel = fakeToolLLM([verdict(false), "รีเซ็ตรหัสผ่าน", verdict(true), "ตอบแล้ว"]);
const retried = await buildAgenticRag(retryModel, index).invoke({ question: "ทำไงดี" });
const giveUpModel = fakeToolLLM([verdict(false), "คำค้นใหม่", verdict(false)]);
const gaveUp = await buildAgenticRag(giveUpModel, index).invoke({ question: "ทำไงดี" });

// ส่วนที่ 2: โมเดลจริง
const real = await buildAgenticRag(llm, index).invoke({ question: "ลืมรหัสผ่านทำไง" });
console.log({ answer: real.answer.slice(0, 100), rewrites: real.rewrites });












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ผลค้นเกี่ยวข้องตั้งแต่ครั้งแรก: ให้คะแนน แล้วตอบ (ไม่เขียนคำค้นใหม่)", direct.answer === "ไปรีเซ็ตที่พอร์ทัล" && direct.rewrites === 0 && directModel.calls.length === 2, "ถ้า relevant คืน \"generate\"");
check("ขั้นตอบเห็นเอกสาร (พร้อมที่มา) และคำถาม", directModel.calls[1][0].text.includes("[it.md]") && directModel.calls[1][0].text.includes("ลืมรหัสผ่านทำไง"));
check("ผู้ให้คะแนนเห็นทั้งคำถามและเอกสาร", directModel.calls[0][0].text.includes("ลืมรหัสผ่านทำไง") && directModel.calls[0][0].text.includes("[it.md]"));
check("ไม่เกี่ยวครั้งแรก: เขียนคำค้นใหม่ ค้นอีกรอบ แล้วตอบ", retried.rewrites === 1 && retried.query === "รีเซ็ตรหัสผ่าน" && retried.docs.includes("[it.md]") && retried.answer === "ตอบแล้ว", "ไม่เกี่ยวและ rewrites < MAX_REWRITES คืน \"rewrite\"");
check("หลังเขียนใหม่ ขั้นให้คะแนนและขั้นตอบยังเห็นคำถามเดิม", retryModel.calls[2][0].text.includes("ทำไงดี") && retryModel.calls[3][0].text.includes("ทำไงดี"));
check("ลองใหม่แล้วยังไม่เกี่ยว: ยอมรับว่าไม่พบ และไม่เรียกโมเดลตอบ", gaveUp.answer === "ไม่พบข้อมูลในเอกสาร" && giveUpModel.calls.length === 3);
check("โมเดลจริง: ได้คำตอบ และเขียนคำค้นใหม่ไม่เกินเพดาน", real.answer.length > 0 && real.rewrites <= MAX_REWRITES);
