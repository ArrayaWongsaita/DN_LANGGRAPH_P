// Playground ของบท 2-18: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-18   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-18 --watch)
// เริ่มใหม่: pnpm play 2-18 --reset
//
// ลองทำดู:
//   1) เปลี่ยนข้อความ reply แล้วดู decision
//   2) พิมพ์ payload ของ interrupt ก่อน resume

import { Command, END, START, MemorySaver, StateGraph, StateSchema, interrupt, isInterrupted } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
