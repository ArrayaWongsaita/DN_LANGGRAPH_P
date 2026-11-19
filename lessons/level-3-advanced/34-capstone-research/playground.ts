// Playground ของบท 3-34: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-34   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-34 --watch)
// เริ่มใหม่: pnpm play 3-34 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ลองถามคำถามค้นคว้าต่าง ๆ กับผู้ช่วยแล้วดูขั้นตอนที่ใช้
//   2) เพิ่ม tool ค้นข้อมูลอีกตัว
//   3) เปลี่ยนรูปแบบรายงานสุดท้าย

import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
