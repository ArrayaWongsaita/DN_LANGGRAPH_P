// Playground ของบท 1-09: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-09   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-09 --watch)
// เริ่มใหม่: pnpm play 1-09 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ประกาศ zod schema ของคนหรือสิ่งของที่สนใจ แล้วใช้ llm.withStructuredOutput ดึงข้อมูลจากข้อความ
//   2) เพิ่ม field ใหม่ เช่น city หรือใช้ z.enum กับ field ที่มีตัวเลือกจำกัด
//   3) ส่งข้อความที่ข้อมูลไม่ครบ แล้วดูว่า LLM ตอบอย่างไร

import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
