// รันด้วย pnpm lesson 2-05
// บทนี้เรียนคำสั่ง trimMessages: ตัดรายการข้อความให้อยู่ในงบ (ใช้ได้โดยไม่ต้องมี API key)
import { AIMessage, HumanMessage, SystemMessage, trimMessages } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import { check } from "@src/check";
import { todo } from "@src/todo";

// ย่อ: S = คำสั่งระบบ, H = ผู้ใช้, A = คำตอบ AI (id เก็บไว้ดูว่าข้อความไหนรอด)
const history = [
  new SystemMessage({ id: "S", content: "ตอบสั้น ๆ" }),
  new HumanMessage({ id: "H1", content: "ฉันชื่อมาลี" }),
  new AIMessage({ id: "A1", content: "สวัสดีมาลี" }),
  new HumanMessage({ id: "H2", content: "ฉันชอบแมว" }),
  new AIMessage({ id: "A2", content: "แมวน่ารักดีนะ" }),
  new HumanMessage({ id: "H3", content: "ฉันอยู่เชียงใหม่" }),
  new AIMessage({ id: "A3", content: "เชียงใหม่น่าเที่ยว" }),
];

// tokenCounter: ฟังก์ชันที่บอกว่ารายการข้อความ "ใช้งบไปเท่าไร"
// ในบทนี้นับ 1 ข้อความ = 1 หน่วย (ของจริงมักนับ token ตามโมเดล) ให้มาแล้ว ไม่ต้องแก้
const countMessages = (messages: BaseMessage[]): number => messages.length;

// 👉 ข้อ 1: เรียก trimMessages ให้เหลือข้อความล่าสุดไม่เกิน 3 ข้อความ
//    และต้องขึ้นต้นด้วยข้อความของผู้ใช้ (ไม่ขึ้นต้นด้วยคำตอบ AI)
// แนวทาง (เอา // ออกแล้วแทนที่ todo ได้เลย):
//   const recent = await trimMessages(history, {
//     maxTokens: 3,                 // งบสูงสุด 3 ข้อความ
//     tokenCounter: countMessages,  // ตัวนับงบด้านบน
//     strategy: "last",             // เก็บท้าย (ข้อความล่าสุด) ทิ้งต้น
//     startOn: "human",             // ผลลัพธ์ต้องขึ้นต้นด้วยข้อความผู้ใช้
//   });
const recent: BaseMessage[] = todo(1);

const recentIds = recent.map((message) => message.id);
console.log("ข้อความที่เหลือ:", recentIds);













// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ได้ H3 และ A3 ตามลำดับ", recentIds.join(",") === "H3,A3", 'maxTokens: 3, strategy: "last", startOn: "human"');
