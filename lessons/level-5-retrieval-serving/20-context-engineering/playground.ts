// Playground ของบท 5-20: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-20   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-20 --watch)
// เริ่มใหม่: pnpm play 5-20 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) เปลี่ยน system prompt แบบไดนามิกจาก runtime context
//   2) เลือกโมเดลต่อรอบจาก context
//   3) ส่ง context ต่างกันแล้วเทียบพฤติกรรม

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { createAgent, createMiddleware, dynamicSystemPromptMiddleware } from "langchain";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
