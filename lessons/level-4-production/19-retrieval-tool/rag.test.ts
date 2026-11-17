import { HumanMessage } from "@langchain/core/messages";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { InMemoryIndex, KeywordEmbeddings, SAMPLE_DOCS } from "@src/rag";
import { buildRagAgent, formatHits, makeSearchTool } from "./rag";

// ตัวตรวจของบทนี้ (ไม่ต้องแก้ไฟล์นี้)
async function makeIndex() {
  const index = new InMemoryIndex(new KeywordEmbeddings());
  await index.add(SAMPLE_DOCS);
  return index;
}

test("formatHits: บรรทัดละชิ้นพร้อมที่มา และตัดชิ้นที่คะแนน 0 ทิ้ง", () => {
  const out = formatHits([
    { source: "it.md", text: "รีเซ็ตรหัสผ่าน", score: 0.9 },
    { source: "hr.md", text: "ไม่เกี่ยว", score: 0 },
  ]);
  expect(out).toBe("[it.md] รีเซ็ตรหัสผ่าน");
});

test("formatHits: ไม่มีชิ้นที่เกี่ยวข้องเลย ต้องบอกชัดเจน ไม่ใช่ข้อความว่าง", () => {
  expect(formatHits([])).toBe("ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร");
  expect(formatHits([{ source: "x", text: "y", score: 0 }])).toBe("ไม่พบข้อมูลที่เกี่ยวข้องในเอกสาร");
});

test("tool ค้นหาคืนข้อความที่ถูกจัดรูปแล้ว", async () => {
  const out = await makeSearchTool(await makeIndex()).invoke({ query: "ลืมรหัสผ่าน" });
  expect(out).toContain("[it.md]");
  expect(out).toContain("รีเซ็ต");
});

test("agent: ค้นเอกสารด้วย tool แล้วตอบ และโมเดลเห็นผลค้นหาพร้อมที่มา", async () => {
  const llm = fakeToolLLM([{ toolCalls: [{ name: "search_docs", args: { query: "ลืมรหัสผ่าน" }, id: "s1" }] }, "ไปรีเซ็ตที่พอร์ทัล IT"]);
  const agent = buildRagAgent(llm, await makeIndex());
  const r = await agent.invoke({ messages: [new HumanMessage("ลืมรหัสผ่านทำไงดี")] });
  expect(r.messages.at(-1)?.text).toBe("ไปรีเซ็ตที่พอร์ทัล IT");
  expect(llm.calls[1].some((m) => m.type === "tool" && m.text.includes("[it.md]"))).toBe(true);
  expect(llm.calls[0][0].type).toBe("system");
  expect(llm.calls[0][0].text).toContain("ไม่ต้องเดา");
});
