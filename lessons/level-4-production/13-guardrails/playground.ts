// Playground ของบท 4-13: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-13   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-13 --watch)
// เริ่มใหม่: pnpm play 4-13 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) เขียน guardrail ที่ปฏิเสธคำขอบางประเภทก่อนถึงโมเดล
//   2) เขียน guardrail ฝั่งคำตอบ
//   3) ลองข้อความที่ใกล้เส้น

import type { BaseCheckpointSaver } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createAgent, createMiddleware } from "langchain";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
