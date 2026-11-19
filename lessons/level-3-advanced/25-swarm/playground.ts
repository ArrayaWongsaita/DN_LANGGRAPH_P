// Playground ของบท 3-25: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-25   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-25 --watch)
// เริ่มใหม่: pnpm play 3-25 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง swarm ที่ agent ส่งต่อกันเองด้วย handoff tool
//   2) เพิ่ม agent ใหม่ในวง
//   3) ดูว่า agent ที่ active เปลี่ยนไปอย่างไร

import { Command, END, MemorySaver, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
