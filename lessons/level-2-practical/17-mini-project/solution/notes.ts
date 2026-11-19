import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { createAgent } from "langchain";
import { z } from "zod";
import { llm } from "../../../level-1-basics/02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-17
// โปรเจกต์ปิด Level 2: ผู้ช่วยจดโน้ต = agent + tool สองตัว (จด / ดู) + ความจำถาวรใน SQLite
// บทนี้รวมของที่เรียนมา: tool (08), createAgent (16), SqliteSaver (07)
const store: string[] = []; // ที่เก็บโน้ต (ในโปรเจกต์จริงอาจเป็นฐานข้อมูล)

const addNote = tool(
  ({ text }: { text: string }) => {
    // ข้อ 1: เก็บ text ลงใน store แล้วคืน `บันทึกแล้ว: ${text}`
    store.push(text);
    return `บันทึกแล้ว: ${text}`;
  },
  {
    name: "addNote",
    description: "จดโน้ตใหม่หนึ่งข้อความ",
    schema: z.object({ text: z.string().describe("ข้อความที่จะจด") }),
  },
);

const listNotes = tool(
  () => {
    // ข้อ 2: ถ้า store ว่างคืน "ยังไม่มีโน้ต" ไม่เช่นนั้นคืนโน้ตทั้งหมดต่อกันบรรทัดละข้อ เช่น "1. ก\n2. ข"
    return store.length === 0 ? "ยังไม่มีโน้ต" : store.map((t, i) => `${i + 1}. ${t}`).join("\n");
  },
  { name: "listNotes", description: "ดูโน้ตทั้งหมดที่จดไว้", schema: z.object({}) },
);

// สร้างผู้ช่วยจาก saver ที่ส่งเข้ามา (เรียกสองครั้งเพื่อจำลองการรีสตาร์ต)
function buildAssistant(saver: SqliteSaver) {
  // ข้อ 3: createAgent ด้วย model: llm, tools: [addNote, listNotes], checkpointer: saver
  //        และ systemPrompt: "คุณคือผู้ช่วยจดโน้ต ตอบสั้น ใช้ tool เมื่อผู้ใช้ขอจดหรือขอดูโน้ต"
  return createAgent({
    model: llm,
    tools: [addNote, listNotes],
    checkpointer: saver,
    systemPrompt: "คุณคือผู้ช่วยจดโน้ต ตอบสั้น ใช้ tool เมื่อผู้ใช้ขอจดหรือขอดูโน้ต",
  });
}

const dir = mkdtempSync(join(tmpdir(), "lg-notes-"));
const file = join(dir, "notes-memory.db");
const config = { configurable: { thread_id: "me" } };

const first = buildAssistant(SqliteSaver.fromConnString(file));
for (const text of ["จดโน้ตว่า ซื้อนม", "จดโน้ตว่า โทรหาแม่"]) {
  const r = await first.invoke({ messages: [new HumanMessage(text)] }, config);
  console.log(r.messages[r.messages.length - 1].text);
}

// "รีสตาร์ต": ผู้ช่วยตัวใหม่จากไฟล์ความจำเดิม ยังรู้ว่าเราคุยอะไรไว้
const restarted = buildAssistant(SqliteSaver.fromConnString(file));
const r = await restarted.invoke({ messages: [new HumanMessage("ฉันให้จดอะไรไปบ้าง")] }, config);
const reply = r.messages[r.messages.length - 1].text;
console.log("หลังรีสตาร์ต:", reply);
rmSync(dir, { recursive: true, force: true });

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("tool addNote เก็บโน้ตลง store ทั้งสองข้อความ", store.length === 2 && store[0].includes("นม") && store[1].includes("แม่"), "ต้องให้ agent เรียก addNote ได้ (ใส่ tools ใน createAgent)");
check("หลังรีสตาร์ต ประวัติเดิมยังอยู่", r.messages.length > 6, "ต้องใช้ checkpointer: saver");
check("หลังรีสตาร์ต ผู้ช่วยบอกโน้ตได้ (กล่าวถึงนมหรือแม่)", reply.includes("นม") || reply.includes("แม่"));
