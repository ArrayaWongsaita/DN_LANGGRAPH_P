// Playground ของบท 2-26: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-26   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-26 --watch)
// เริ่มใหม่: pnpm play 2-26 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ปรับพารามิเตอร์ของโมเดลแล้วอ่าน usage_metadata
//   2) รวม token ของหลายคำถาม
//   3) เทียบคำถามสั้นกับยาว

import type { AIMessage } from "@langchain/core/messages";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
