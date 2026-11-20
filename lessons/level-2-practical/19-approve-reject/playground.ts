// Playground ของบท 2-19: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-19   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-19 --watch)
// เริ่มใหม่: pnpm play 2-19 --reset
//
// ลองทำดู:
//   1) เทียบ resume ที่เป็น true, false และสตริง true
//   2) ดูคำถามที่ค้างจาก getState ก่อนตอบ

import { Command, END, START, MemorySaver, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
