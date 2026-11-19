// Playground ของบท 1-13: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 1-13   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 1-13 --watch)
// เริ่มใหม่: pnpm play 1-13 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) สร้าง graph ที่มี node เดียวส่ง state.question ให้ llm แล้วเก็บคำตอบลง state
//   2) เพิ่ม system prompt ใน node เพื่อคุมสไตล์คำตอบ
//   3) เพิ่ม field เก็บความยาวของคำตอบ

import { END, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
