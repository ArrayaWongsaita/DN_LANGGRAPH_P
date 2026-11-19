// Playground ของบท 5-25: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-25   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-25 --watch)
// เริ่มใหม่: pnpm play 5-25 --reset
//
// ลองทำดู:
//   1) แปลงสตรีมเป็นสถานะ UI ด้วย reducer
//   2) แสดงความคืบหน้าแบบไดนามิก
//   3) ต่อข้อความ markdown ที่มาไม่ครบ

import { END, START, StateGraph, StateSchema, StreamChannel } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
