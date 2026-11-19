// Playground ของบท 4-01: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-01   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-01 --watch)
// เริ่มใหม่: pnpm play 4-01 --reset
//
// ลองทำดู:
//   1) ตั้ง timeout ให้ node แล้วจำลอง node ที่ค้าง
//   2) จับ error ของ timeout
//   3) เทียบ timeout สั้นกับยาว

import { END, START, StateGraph, StateSchema, isNodeTimeoutError } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
