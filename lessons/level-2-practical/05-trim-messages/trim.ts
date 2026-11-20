// รันด้วย pnpm lesson 2-05
import { AIMessage, HumanMessage, SystemMessage, trimMessages } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { check } from "@src/check";
import { todo } from "@src/todo";

const history = [
  new SystemMessage({ id: "S", content: "ตอบสั้น ๆ" }),
  new HumanMessage({ id: "H1", content: "ฉันชื่อมาลี" }),
  new AIMessage({ id: "A1", content: "สวัสดีมาลี" }),
  new HumanMessage({ id: "H2", content: "ฉันชอบแมว" }),
  new AIMessage({ id: "A2", content: "แมวน่ารักดีนะ" }),
  new HumanMessage({ id: "H3", content: "ฉันอยู่เชียงใหม่" }),
  new AIMessage({ id: "A3", content: "เชียงใหม่น่าเที่ยว" }),
];

const budget = {
  maxTokens: 3,
  // 👉 ข้อ 1 ให้ tokenCounter คืนจำนวนข้อความใน messages
  tokenCounter: (messages: BaseMessage[]): number => todo(1),
};

const recent = await trimMessages(history, {
  ...budget,
  strategy: "last",
  startOn: "human",
});

const recentIds = recent.map((message) => message.id);
console.log(recentIds);
console.log(JSON.stringify(recent.map(({ type, content }) => ({ type, content })), null, 2));

// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("นับ 1 หน่วยต่อข้อความ", budget.tokenCounter(history) === 7 && budget.tokenCounter([]) === 0, "คืน messages.length");
check("ได้ H3 และ A3 ตามลำดับ", recentIds.join(",") === "H3,A3", "ให้ tokenCounter คืน messages.length");
