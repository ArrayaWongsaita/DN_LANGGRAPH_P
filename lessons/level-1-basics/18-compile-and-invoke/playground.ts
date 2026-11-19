// Playground ของบท 1-18: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-18   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-18 --watch)
// เริ่มใหม่: pnpm play 1-18 --reset
//
// ลองทำดู:
//   1) สร้าง graph ที่วนไม่จบ แล้ว invoke ด้วย recursionLimit ต่าง ๆ ดูว่า error บอกอะไร
//   2) ลอง compile graph ที่ลืมต่อ edge แล้วดู error
//   3) ลองส่งค่าเริ่มต้นหลายค่าให้ graph ที่รันได้ปกติ

import { END, GraphRecursionError, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
