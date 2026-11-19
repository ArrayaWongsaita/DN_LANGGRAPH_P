// Playground ของบท 3-35: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-35   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-35 --watch)
// เริ่มใหม่: pnpm play 3-35 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) เพิ่มความสามารถให้ผู้ช่วยพร้อมใช้งานจริง เช่น จำผู้ใช้ข้ามการรัน
//   2) ลองกรณีผิดพลาดและดูว่าระบบรับมืออย่างไร
//   3) เพิ่ม middleware ที่คุณเลือกจากบท 3-27 ถึง 3-30

import { Command, END, InMemoryStore, MemorySaver, START, StateGraph, StateSchema, interrupt } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
