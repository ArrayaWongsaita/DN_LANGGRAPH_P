// Playground ของบท 3-16: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-16   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-16 --watch)
// เริ่มใหม่: pnpm play 3-16 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) จัดประเภทคำถามด้วย structured output แล้วส่งไปผู้เชี่ยวชาญแต่ละคน
//   2) เพิ่มประเภทใหม่
//   3) ลองคำถามกำกวม

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
