import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { type Hit, InMemoryIndex, KeywordEmbeddings, SAMPLE_DOCS } from "@src/rag";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 4-19
// RAG แบบง่ายที่สุด: ให้การค้นเอกสารเป็น tool ของ agent โมเดลตัดสินเองว่าจะค้นเมื่อไหร่ แล้วตอบจากผลที่ได้ (ไม่ต้องเดา)
// จัดรูปผลค้นหาเป็นข้อความให้โมเดลอ่าน
function formatHits(hits: Hit[]): string {
  const relevant = hits.filter((h) => h.score > 0);
  if (relevant.length === 0) return "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร";
  return relevant.map((h) => `[${h.source}] ${h.text}`).join("\n");
}

function makeSearchTool(index: InMemoryIndex) {
  return tool(
    async ({ query }: { query: string }) => {
      return formatHits(await index.search(query, 2));
    },
    {
      name: "search_docs",
      description: "ค้นเอกสารภายในบริษัท (นโยบาย, IT, การคืนสินค้า) ใช้เมื่อคำถามต้องการข้อมูลจากเอกสาร",
      schema: z.object({ query: z.string() }),
    },
  );
}

function buildRagAgent(model: BaseChatModel, index: InMemoryIndex) {
  return createAgent({
    model,
    tools: [makeSearchTool(index)],
    systemPrompt: "ตอบจากผลของ search_docs เท่านั้น ถ้าไม่พบให้บอกตรง ๆ ว่าไม่พบ ไม่ต้องเดา",
  });
}

const index = new InMemoryIndex(new KeywordEmbeddings());
await index.add(SAMPLE_DOCS);

// ตัวจัดรูปและ tool แยกกัน
const formatted = formatHits([
  { source: "it.md", text: "รีเซ็ตรหัสผ่าน", score: 0.9 },
  { source: "hr.md", text: "ไม่เกี่ยว", score: 0 },
]);
const emptyA = formatHits([]);
const emptyB = formatHits([{ source: "x", text: "y", score: 0 }]);
const toolOut = String(await makeSearchTool(index).invoke({ query: "ลืมรหัสผ่าน" }));

// โมเดลปลอมที่สั่งค้นแล้วตอบ: ดูว่าโมเดลเห็นอะไร
const fake = fakeToolLLM([{ toolCalls: [{ name: "search_docs", args: { query: "ลืมรหัสผ่าน" }, id: "s1" }] }, "ไปรีเซ็ตที่พอร์ทัล IT"]);
const r = await buildRagAgent(fake, index).invoke({ messages: [new HumanMessage("ลืมรหัสผ่านทำไงดี")] });

// โมเดลจริง: ถามเรื่องในเอกสาร และเรื่องที่ไม่มีในเอกสาร
const real = await buildRagAgent(llm, index).invoke({ messages: [new HumanMessage("ลืมรหัสผ่านต้องทำอย่างไร")] });
console.log("โมเดลจริงตอบ:", real.messages.at(-1)?.text);












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("formatHits: บรรทัดละชิ้นพร้อมที่มา และตัดชิ้นที่คะแนน 0 ทิ้ง", formatted === "[it.md] รีเซ็ตรหัสผ่าน", "กรอง score > 0 แล้ว map เป็น `[source] text`");
check("formatHits: ไม่มีชิ้นที่เกี่ยวข้องเลย ต้องบอกชัดเจน ไม่ใช่ข้อความว่าง", emptyA === "ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร" && emptyB === emptyA);
check("tool ค้นหาคืนข้อความที่ถูกจัดรูปแล้ว", toolOut.includes("[it.md]") && toolOut.includes("รีเซ็ต"));
check("agent: ค้นด้วย tool แล้วตอบ และโมเดลเห็นผลค้นหาพร้อมที่มา", r.messages.at(-1)?.text === "ไปรีเซ็ตที่พอร์ทัล IT" && fake.calls[1].some((m) => m.type === "tool" && m.text.includes("[it.md]")));
check("system prompt สั่งให้ตอบจากเอกสาร ไม่ต้องเดา", fake.calls[0][0].type === "system" && fake.calls[0][0].text.includes("ไม่ต้องเดา"), "ใส่ systemPrompt ตามโจทย์");
check("โมเดลจริงค้นเอกสารแล้วตอบ (มีคำว่า รีเซ็ต หรือ พอร์ทัล)", /รีเซ็ต|พอร์ทัล/.test(real.messages.at(-1)?.text ?? ""));
