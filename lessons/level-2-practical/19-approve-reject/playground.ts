// Playground ของบท 2-19: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-19   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-19 --watch)
// เริ่มใหม่: pnpm play 2-19 --reset
//
// ลองทำดู:
//   1) ให้มนุษย์อนุมัติหรือปฏิเสธ แล้วแยกทางด้วย conditional edge
//   2) resume ด้วย true และ false แล้วเทียบ
//   3) เพิ่มทางที่สามสำหรับ "ขอข้อมูลเพิ่ม"

import { Command, END, MemorySaver, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
