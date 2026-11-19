// Playground ของบท 3-19: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-19   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-19 --watch)
// เริ่มใหม่: pnpm play 3-19 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) เขียน ตรวจ แก้ วนจนผ่าน พร้อมจำกัดจำนวนรอบ
//   2) เปลี่ยนเกณฑ์ที่ใช้ตรวจ
//   3) พิมพ์ feedback ของแต่ละรอบ

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
