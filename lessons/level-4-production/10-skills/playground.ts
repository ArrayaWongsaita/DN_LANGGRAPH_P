// Playground ของบท 4-10: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-10   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-10 --watch)
// เริ่มใหม่: pnpm play 4-10 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) เขียน skills เป็นความรู้ที่โหลดตามต้องการ
//   2) เพิ่ม skill ใหม่
//   3) ถามคำถามที่ต้องใช้ skill คนละอัน

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
