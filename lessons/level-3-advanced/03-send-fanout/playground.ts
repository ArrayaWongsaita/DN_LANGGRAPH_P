// Playground ของบท 3-03: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-03   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-03 --watch)
// เริ่มใหม่: pnpm play 3-03 --reset
//
// ลองทำดู:
//   1) ใช้ Send แตกงานตามรายการ แล้วให้ node ทำงานทีละชิ้น
//   2) รวมผลด้วย reducer
//   3) ลองรายการที่ว่างเปล่า

import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
