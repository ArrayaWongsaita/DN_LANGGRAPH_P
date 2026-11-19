// Playground ของบท 4-11: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-11   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-11 --watch)
// เริ่มใหม่: pnpm play 4-11 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) แยกคำถามไปหลายแหล่งความรู้แบบขนานแล้วรวมคำตอบ
//   2) เพิ่มแหล่งความรู้ใหม่
//   3) ลองคำถามที่ตรงกับหลายแหล่ง

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { END, ReducedValue, Send, START, StateGraph, StateSchema } from "@langchain/langgraph";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
