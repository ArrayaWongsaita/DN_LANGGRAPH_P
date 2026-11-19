// Playground ของบท 1-04: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-04   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-04 --watch)
// เริ่มใหม่: pnpm play 1-04 --reset
//
// ลองทำดู:
//   1) สร้าง model ที่ตั้ง temperature ต่างกัน (เช่น 0, 0.7, 1.5) แล้วถามคำถามเดิมหลายรอบ
//   2) ถามคำถามปลายเปิด เช่น ให้แต่งสโลแกน แล้วเทียบความหลากหลายของแต่ละค่า
//   3) เทียบคำถามที่มีคำตอบเดียว กับคำถามปลายเปิด

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGroq } from "@langchain/groq"; // ตัวอย่างใช้ Groq ถ้าเลือกเจ้าอื่นในบท 02 ให้เปลี่ยน import กับ new ... ตามบล็อกของเจ้านั้น
import { env } from "@lessons/level-1-basics/01-env-schema/solution/env";

// เขียนโค้ดของคุณตรงนี้
