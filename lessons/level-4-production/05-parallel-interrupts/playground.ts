// Playground ของบท 4-05: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-05   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-05 --watch)
// เริ่มใหม่: pnpm play 4-05 --reset
//
// ลองทำดู:
//   1) สร้างหลาย interrupt พร้อมกันในสายขนาน
//   2) resume ทั้งหมดในครั้งเดียว
//   3) ลอง resume แค่บางส่วน

import { Command, END, INTERRUPT, MemorySaver, START, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
