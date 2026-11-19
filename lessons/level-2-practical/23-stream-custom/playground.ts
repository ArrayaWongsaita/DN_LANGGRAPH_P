// Playground ของบท 2-23: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-23   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-23 --watch)
// เริ่มใหม่: pnpm play 2-23 --reset
//
// ลองทำดู:
//   1) ส่งความคืบหน้าเองด้วย config.writer แล้วอ่านด้วย streamMode "custom"
//   2) เพิ่มข้อมูลอื่นใน payload เช่น เปอร์เซ็นต์
//   3) ลองส่งหลายครั้งใน node เดียว

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
