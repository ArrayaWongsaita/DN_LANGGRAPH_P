// Playground ของบท 3-09: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-09   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-09 --watch)
// เริ่มใหม่: pnpm play 3-09 --reset
//
// ลองทำดู:
//   1) สร้างลูปที่หยุดเมื่อถึงเป้าหมาย พร้อมกำหนด recursionLimit
//   2) ลองตั้ง limit ต่ำกว่าที่ต้องใช้แล้วดู error
//   3) จับ GraphRecursionError

import { END, GraphRecursionError, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";

// เขียนโค้ดของคุณตรงนี้
