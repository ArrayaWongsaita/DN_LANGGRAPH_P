// Playground ของบท 1-17: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-17   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-17 --watch)
// เริ่มใหม่: pnpm play 1-17 --reset
//
// ลองทำดู:
//   1) สร้าง field ที่ใช้ ReducedValue เก็บรายการ แล้วให้สอง node เพิ่มค่าเข้าไป
//   2) เพิ่ม field ที่รวมค่าอีกแบบ เช่น เก็บค่ามากที่สุดด้วย Math.max
//   3) ลองเอา reducer ออกแล้วดูว่าค่าถูกทับ

import { END, ReducedValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
