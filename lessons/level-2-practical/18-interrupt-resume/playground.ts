// Playground ของบท 2-18: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-18   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-18 --watch)
// เริ่มใหม่: pnpm play 2-18 --reset
//
// ลองทำดู:
//   1) สร้าง node ที่เรียก interrupt แล้วรอคำตอบจากมนุษย์
//   2) resume ด้วย Command({ resume })
//   3) พิมพ์สิ่งที่ค้างอยู่จาก getState

import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
