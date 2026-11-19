// Playground ของบท 3-17: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-17   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-17 --watch)
// เริ่มใหม่: pnpm play 3-17 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ตรวจหลายด้านพร้อมกัน (เช่น ปลอดภัย น้ำเสียง ความยาว) แล้วรวมรายงาน
//   2) เพิ่มด้านที่สี่
//   3) ลองข้อความที่ไม่ผ่านบางด้าน

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
