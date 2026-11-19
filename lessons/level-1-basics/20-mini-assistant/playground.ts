// Playground ของบท 1-20: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-20   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-20 --watch)
// เริ่มใหม่: pnpm play 1-20 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้างผู้ช่วยที่จัดหมวดข้อความก่อน (structured output) แล้วใช้ conditional edge เลือกทางตอบ
//   2) เพิ่มหมวดที่สาม เช่น "thanks" พร้อม node ตอบสำเร็จรูป
//   3) ลองถามหลายแบบแล้วดูว่าถูกจัดหมวดไหน

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
