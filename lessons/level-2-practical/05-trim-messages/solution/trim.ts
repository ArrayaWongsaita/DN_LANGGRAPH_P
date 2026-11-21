// รันด้วย pnpm exec tsx lessons/level-2-practical/05-trim-messages/solution/trim.ts
import { AIMessage, HumanMessage, SystemMessage, trimMessages } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { check } from "@src/check";

const history = [
  new SystemMessage({ id: "S", content: "ตอบสั้น ๆ" }),
  new HumanMessage({ id: "H1", content: "ฉันชื่อมาลี" }),
  new AIMessage({ id: "A1", content: "สวัสดีมาลี" }),
  new HumanMessage({ id: "H2", content: "ฉันชอบแมว" }),
  new AIMessage({ id: "A2", content: "แมวน่ารักดีนะ" }),
  new HumanMessage({ id: "H3", content: "ฉันอยู่เชียงใหม่" }),
  new AIMessage({ id: "A3", content: "เชียงใหม่น่าเที่ยว" }),
];

const countMessages = (messages: BaseMessage[]): number => messages.length;

const recent = await trimMessages(history, {
  maxTokens: 3,
  tokenCounter: countMessages,
  strategy: "last",
  startOn: "human",
});

const recentIds = recent.map((message) => message.id);
console.log("ข้อความที่เหลือ:", recentIds);













// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ H3 และ A3 ตามลำดับ", recentIds.join(",") === "H3,A3", 'maxTokens: 3, strategy: "last", startOn: "human"');
