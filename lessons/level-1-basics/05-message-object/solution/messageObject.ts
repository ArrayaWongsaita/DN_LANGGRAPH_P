import { AIMessage } from "@langchain/core/messages";
import { check } from "@src/check";

// ใช้ข้อความตัวอย่างพร้อมสถิติที่กำหนดไว้ รันได้โดยไม่ใช้ API key
const reply = new AIMessage({
  content: [
    { type: "text", text: "สวัสดี " },
    { type: "text", text: "มาลี" },
  ],
  usage_metadata: { input_tokens: 8, output_tokens: 4, total_tokens: 12 },
});

const summary = { type: reply.type, text: reply.text };
console.log("summary", summary);
console.log("content", reply.content);
console.log("usage_metadata", reply.usage_metadata);

// ส่วนตรวจคำตอบ ไม่ต้องแก้ และไม่ต้องอ่านก็ได้
check("อ่านชนิดข้อความได้ ai", summary.type === "ai", "ใช้ reply.type");
check("อ่านข้อความจากทั้งสองบล็อก", summary.text === "สวัสดี มาลี", "ใช้ reply.text เพื่อรวมบล็อกข้อความ");
