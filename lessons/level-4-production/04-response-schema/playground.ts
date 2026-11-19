// Playground ของบท 4-04: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-04   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-04 --watch)
// เริ่มใหม่: pnpm play 4-04 --reset
//
// ลองทำดู:
//   1) ตรวจคำตอบของมนุษย์ด้วย responseSchema ของ zod
//   2) ส่งคำตอบที่ผิดรูปแบบแล้วดูผล
//   3) เพิ่มเงื่อนไขใน schema เช่น ค่าที่อนุญาต

import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
