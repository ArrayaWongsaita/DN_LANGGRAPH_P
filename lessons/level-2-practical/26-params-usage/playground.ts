// Playground ของบท 2-26: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-26   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-26 --watch)
// เริ่มใหม่: pnpm play 2-26 --reset
//
// ลองทำดู:
//   1) เพิ่ม usage_metadata ให้คำตอบที่เดิมไม่มีค่า
//   2) ลองรวม input_tokens กับ output_tokens แยกกัน
//   3) เทียบสองค่า temperature ในตัวอย่าง live

import { AIMessage } from "@langchain/core/messages";
import { getLLM } from "@src/llm";

// เขียนโค้ดของคุณตรงนี้
