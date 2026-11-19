// Playground ของบท 4-09: ไฟล์นี้เป็นของคุณ เขียนโค้ดต่อจาก import ด้านล่างได้เลย ไม่มีการตรวจผล
// รันด้วย: pnpm play 4-09   (รันซ้ำทุกครั้งที่บันทึก: pnpm play 4-09 --watch)
// เริ่มใหม่: pnpm play 4-09 --reset
//
// ต้องใช้: key ของ LLM ที่ตั้งไว้ในบท 1-02
//
// ลองทำดู:
//   1) ทำ subagent เป็น tool ของ agent หลัก
//   2) เพิ่ม subagent ที่สอง
//   3) ถามคำถามที่ต้องใช้ทั้งสอง

import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { makeAddTool } from "@src/sampleTools";
import { z } from "zod";
import { fakeToolLLM } from "@src/fakeToolLLM";
import { llm } from "@lessons/level-1-basics/02-llm-config/solution/llm";

// เขียนโค้ดของคุณตรงนี้
