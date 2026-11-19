// Playground ของบท 1-16: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-16   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-16 --watch)
// เริ่มใหม่: pnpm play 1-16 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง loop ที่ให้ LLM ปรับปรุงข้อความทีละรอบ โดยจำกัดจำนวนรอบ
//   2) ลองเงื่อนไขหยุดอื่น เช่น หยุดเมื่อข้อความยาวเกินที่กำหนด
//   3) ลองเปลี่ยนจำนวนรอบสูงสุดแล้วดูผล

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
