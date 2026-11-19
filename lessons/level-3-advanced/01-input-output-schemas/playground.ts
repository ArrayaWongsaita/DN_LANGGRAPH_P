// Playground ของบท 3-01: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-01   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-01 --watch)
// เริ่มใหม่: pnpm play 3-01 --reset
//
// ลองทำดู:
//   1) กำหนด schema input และ output แยกจาก state เต็มของ graph
//   2) เพิ่ม field ส่วนตัวที่ไม่ปรากฏในผลลัพธ์
//   3) invoke แล้วดูว่าผลลัพธ์มีเฉพาะ field ของ output

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
