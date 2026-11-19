// Playground ของบท 1-07: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-07   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-07 --watch)
// เริ่มใหม่: pnpm play 1-07 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง ChatPromptTemplate ที่มีช่อง {language} และ {text} แล้วต่อเข้ากับ llm
//   2) เพิ่มช่อง {tone} ให้เลือกน้ำเสียงของคำแปล
//   3) ทำแม่แบบที่ไม่ใช่การแปล เช่น สรุปข้อความใน {n} ประโยค

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
