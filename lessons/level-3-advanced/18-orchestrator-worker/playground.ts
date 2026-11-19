// Playground ของบท 3-18: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-18   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-18 --watch)
// เริ่มใหม่: pnpm play 3-18 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ให้ orchestrator วางแผนเป็นรายการงาน แล้วแตก worker ด้วย Send
//   2) รวมผลเป็นรายงาน
//   3) เปลี่ยนหัวข้อและจำนวนงาน

import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
