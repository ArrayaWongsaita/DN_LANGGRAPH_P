// Playground ของบท 2-01: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 2-01   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 2-01 --watch)
// เริ่มใหม่: pnpm play 2-01 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง graph ที่เก็บข้อความใน messages แล้วต่อคำตอบของ llm เข้าไปทุกรอบ
//   2) invoke สองครั้งต่อกัน โดยส่ง state ของรอบแรกเข้าไปในรอบสอง
//   3) พิมพ์จำนวนข้อความหลังแต่ละรอบ

import { HumanMessage } from "@langchain/core/messages";
import { END, MessagesValue, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
