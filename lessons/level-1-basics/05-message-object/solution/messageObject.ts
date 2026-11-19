import { HumanMessage } from "@langchain/core/messages";
import { llm } from "../../02-llm-config/solution/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 05  (ต้องตั้ง llm ในบท 02 ให้เสร็จก่อน)

const question = "ตอบสั้น ๆ ว่า สวัสดี";

// ข้อ 1: ห่อคำถามเป็น HumanMessage แล้วส่งให้ llm.invoke (ส่งเป็น array ที่มีข้อความเดียว)
const reply = await llm.invoke([new HumanMessage(question)]);

// ข้อ 2: สรุปว่าคำตอบเป็นข้อความชนิดไหน (reply.type) และข้อความล้วน ๆ คืออะไร (reply.text)
const summary = { type: reply.type, text: reply.text };

// ดู message object ดิบ ๆ ว่ามีอะไรอยู่บ้าง (ไม่ต้องแก้)
console.log("summary:", summary);
console.log("content:", reply.content);
console.log("usage_metadata:", reply.usage_metadata);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("type ของคำตอบคือ 'ai'", summary.type === "ai", "ดู reply.type");
check("text เป็น string ที่ไม่ว่าง", typeof summary.text === "string" && summary.text.length > 0, "ดู reply.text");
