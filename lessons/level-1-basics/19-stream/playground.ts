// Playground ของบท 1-19: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-19   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-19 --watch)
// เริ่มใหม่: pnpm play 1-19 --reset
//
// ลองทำดู:
//   1) เปิด stream แบบ updates และ values ด้วย input เดียวกัน
//   2) เปลี่ยนข้อความที่ส่งให้ node clean
//   3) เทียบชิ้นสุดท้ายกับผลจาก invoke

import { END, START, StateGraph, StateSchema, type StreamMode } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
