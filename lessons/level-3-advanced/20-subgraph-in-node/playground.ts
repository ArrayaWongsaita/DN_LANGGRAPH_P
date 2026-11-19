// Playground ของบท 3-20: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-20   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-20 --watch)
// เริ่มใหม่: pnpm play 3-20 --reset
//
// ลองทำดู:
//   1) เรียก subgraph ภายใน node ที่ state ต่างกัน แล้วแปลงชื่อ field เอง
//   2) เพิ่ม subgraph ตัวที่สอง
//   3) ลอง input ที่ว่าง

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
