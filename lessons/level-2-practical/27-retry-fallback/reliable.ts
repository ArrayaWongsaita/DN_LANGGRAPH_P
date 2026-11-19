import type { AIMessageChunk } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { todo } from "@src/todo";
import { llm } from "../../level-1-basics/02-llm-config/llm";
import { check } from "@src/check";

// รันด้วย: pnpm lesson 2-27
// บริการ LLM ล่มได้เสมอ: withRetry = ลองใหม่เมื่อพลาด, withFallbacks = ถ้ายังพลาดให้ใช้ตัวสำรอง
// ตัวหลักในบทนี้คือ "ตัวจำลองที่ล่มตลอด" (นับจำนวนครั้งที่ถูกเรียกไว้) ตัวสำรองคือ llm จริง
let attempts = 0;
const primary = RunnableLambda.from(async (_input: string): Promise<AIMessageChunk> => {
  attempts++;
  throw new Error("primary ล่ม");
});

// 👉 ข้อ 1: ทำให้ primary ลองรวมสูงสุด 3 ครั้ง: primary.withRetry({ stopAfterAttempt: 3 })
const retrying = todo(1);
// 👉 ข้อ 2: เพิ่มตัวสำรอง: retrying.withFallbacks({ fallbacks: [llm] })
const sturdy = todo(2);

const reply = await sturdy.invoke("ทักทายหนึ่งประโยค");
console.log(`ตัวหลักถูกเรียก ${attempts} ครั้ง แล้วใช้ตัวสำรองตอบ:`, reply.text);

// ─────────────────────────────────────────────────────────────
// ส่วนตรวจคำตอบ: ไม่ต้องแก้ และไม่ต้องอ่านก็ได้ (ไม่ใช่เนื้อหาของบทนี้)
// ─────────────────────────────────────────────────────────────
check("ตัวหลักถูกลองครบ 3 ครั้งก่อนยอมแพ้", attempts === 3, "withRetry({ stopAfterAttempt: 3 })");
check("ตัวสำรองตอบแทนเมื่อตัวหลักล่ม", typeof reply.text === "string" && reply.text.length > 0, "retrying.withFallbacks({ fallbacks: [llm] })");
