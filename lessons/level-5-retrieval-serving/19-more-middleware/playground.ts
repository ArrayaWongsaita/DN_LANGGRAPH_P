// Playground ของบท 5-19: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 5-19   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 5-19 --watch)
// เริ่มใหม่: pnpm play 5-19 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ใส่ middleware tool selector, to-do list หรือ tool emulator ให้ agent
//   2) เทียบ agent ที่มีและไม่มี middleware
//   3) ลองคำถามที่ใช้ tool จำนวนมาก

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { tool } from "@langchain/core/tools";
import { createAgent, llmToolSelectorMiddleware, todoListMiddleware, toolEmulatorMiddleware } from "langchain";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
