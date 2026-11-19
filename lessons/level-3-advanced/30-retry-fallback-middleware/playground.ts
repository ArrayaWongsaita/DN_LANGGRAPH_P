// Playground ของบท 3-30: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 3-30   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 3-30 --watch)
// เริ่มใหม่: pnpm play 3-30 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ใส่ modelRetry และ modelFallback middleware ให้ agent
//   2) เขียน middleware ของตัวเองที่พิมพ์ log ทุกครั้งที่เรียกโมเดล
//   3) จำลองโมเดลที่ล้มแล้วดูการสลับ

import type { BaseMessage } from "@langchain/core/messages";
import { HumanMessage } from "@langchain/core/messages";
import type { ChatResult } from "@langchain/core/outputs";
import { createAgent, createMiddleware, modelFallbackMiddleware, modelRetryMiddleware } from "langchain";
import { FakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
