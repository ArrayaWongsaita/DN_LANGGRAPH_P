// Playground ของบท 1-14: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-14   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-14 --watch)
// เริ่มใหม่: pnpm play 1-14 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง graph สอง node ที่ node แรกเขียนร่าง node สองปรับปรุงร่างนั้น
//   2) ลองเรื่องอื่น เช่น เขียนอีเมล แล้วให้ node สองทำให้สุภาพขึ้น
//   3) เพิ่ม node ที่สามที่ย่อผลลัพธ์เหลือหนึ่งประโยค

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
