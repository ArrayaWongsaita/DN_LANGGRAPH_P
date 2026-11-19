// Playground ของบท 4-08: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-08   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-08 --watch)
// เริ่มใหม่: pnpm play 4-08 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้างชุดทดสอบ (eval) หลายกรณีแล้วคำนวณคะแนน
//   2) เพิ่มกรณีที่ยาก
//   3) เปลี่ยนเกณฑ์ให้คะแนน

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
