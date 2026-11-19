import { llm } from "../../02-llm-config/solution/llm"; // chat model ที่คุณตั้งไว้ในบท 02
import { check } from "@src/check";

// รันด้วย: pnpm lesson 1-03
// อ่านจากบนลงล่างได้เลย ไม่มีฟังก์ชันครอบ

// 1) คำถามที่จะส่ง
const question = "ทักทายคนที่เพิ่งเริ่มเรียน LangGraph หนึ่งประโยค";

// ข้อ 1: ส่ง question ให้ LLM แล้วรอผลลัพธ์
const reply = await llm.invoke(question);

// ข้อ 2: เอาเฉพาะข้อความของคำตอบ (reply เป็น object ข้อความ ไม่ใช่ string ตรง ๆ)
const answer = reply.text;

// 2) ดูผล (ไม่ต้องแก้)
console.log("คำถาม:", question);
console.log("คำตอบ:", answer);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("answer เป็น string ที่ไม่ว่าง", typeof answer === "string" && answer.length > 0, "ลืม await หรือ .text หรือเปล่า?");
