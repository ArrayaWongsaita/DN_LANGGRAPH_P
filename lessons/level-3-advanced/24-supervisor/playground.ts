// Playground ของบท 3-24: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-24   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-24 --watch)
// เริ่มใหม่: pnpm play 3-24 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง supervisor ที่เลือกลูกทีมแล้วมอบงาน
//   2) เพิ่มลูกทีมใหม่ที่ทำงานคนละด้าน
//   3) ลองคำถามที่ต้องใช้ลูกทีมสองคน

import { Command, END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
