// รันด้วย pnpm lesson 2-17 หลังตั้งค่า .env และทำบท 1-01 กับ 1-02
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HumanMessage, type BaseMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { createAgent } from "langchain";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

const store: string[] = [];

const addNote = tool(
  ({ text }) => {
    store.push(text);
    return `บันทึกแล้ว: ${text}`;
  },
  { name: "addNote", description: "จดโน้ตใหม่หนึ่งข้อความ", schema: z.object({ text: z.string() }) },
);

const listNotes = tool(
  () => {
    return store.length === 0 ? "ยังไม่มีโน้ต" : store.map((text, i) => `${i + 1}. ${text}`).join("\n");
  },
  { name: "listNotes", description: "ดูรายการโน้ตที่จดในรอบการเปิดโปรแกรมนี้", schema: z.object({}) },
);

function buildAssistant(saver: SqliteSaver): ReturnType<typeof createAgent> {
  return createAgent({
    model: llm,
    tools: [addNote, listNotes],
    checkpointer: saver,
    systemPrompt: "คุณคือผู้ช่วยจดโน้ต ตอบสั้น ใช้ addNote เมื่อผู้ใช้ขอจด ใช้ listNotes เมื่อขอดูรายการโน้ต สำหรับคำถามเกี่ยวกับแชตก่อนหน้าให้ดูข้อความในบทสนทนา",
  });
}

const dir = mkdtempSync(join(tmpdir(), "lg-notes-"));
const file = join(dir, "notes-memory.db");
const config = { configurable: { thread_id: "mali" } };
let saver = SqliteSaver.fromConnString(file);

try {
  const assistant = buildAssistant(saver);
  for (const text of ["จดโน้ตว่า ซื้อนม", "จดโน้ตว่า โทรหาแม่"]) {
    await assistant.invoke({ messages: [new HumanMessage(text)] }, config);
  }

  const listed: { messages: BaseMessage[] } = await assistant.invoke({ messages: [new HumanMessage("ขอดูรายการโน้ต")] }, config);
  const notes = [...store];
  const listing = listed.messages.filter((message) => message.type === "tool" && message.name === "listNotes").at(-1)?.text;
  console.log(JSON.stringify({ notes, listing }));

  saver.db.close();
  store.length = 0; // จำลองการเปิดโปรแกรมใหม่
  saver = SqliteSaver.fromConnString(file);
  const restarted = buildAssistant(saver);
  const reply: { messages: BaseMessage[] } = await restarted.invoke({ messages: [new HumanMessage("ในแชตก่อนหน้าฉันขอให้จดอะไร")] }, config);
  const history = reply.messages.filter((message) => message.type === "human").map((message) => message.text);
  console.log(JSON.stringify({ notes: store, history, reply: reply.messages.at(-1)?.text }));












// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
  check("agent เรียก addNote เพื่อเก็บโน้ตสองรายการ", notes.length === 2 && notes[0].includes("นม") && notes[1].includes("แม่"));
  check("agent เรียก listNotes และได้รายการพร้อมเลขลำดับ", listing === notes.map((text, i) => `${i + 1}. ${text}`).join("\n"));
  check("เปิดไฟล์เดิมกับ thread เดิมแล้วได้ข้อความก่อนหน้า", history[0] === "จดโน้ตว่า ซื้อนม" && history[1] === "จดโน้ตว่า โทรหาแม่", "ตั้ง checkpointer: saver");
  check("รายการในหน่วยความจำว่างหลังจำลองการเปิดใหม่", await listNotes.invoke({}) === "ยังไม่มีโน้ต");
} finally {
  if (saver.db.open) saver.db.close();
  rmSync(dir, { recursive: true, force: true });
}
